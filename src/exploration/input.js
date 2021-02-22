import * as tf from '@tensorflow/tfjs';



/**
 * @typedef {Object} InputDefinition
 * @property {'zero'|'onehot'|'random'} generationType
 * @property {number | Array<number>} shape
 */
export function generateFromDefinition(def) {
    if (!def) return
    const {generationType, shape} = def;

    if (generationType === 'randomUniform') {
        return tf.randomUniform(shape)
    }
    if (generationType === 'randomNormal') {
        return tf.randomNormal(shape)
    }
    else if (generationType === 'zeros') {
        return tf.zeros(shape)
    }
    else if (generationType === 'ones') {
        return tf.ones(shape)
    }
    else if (generationType === 'oneHot') {
        return tf.oneHot(Math.floor(Math.random() * shape[0]), shape[0])
    }
    else if (typeof generationType === 'function') {
        return generationType(shape)
    }
    else {
        throw 'generation type not recognized'
    }
}

export class Direction extends Array {
    constructor() {
        super()
        return new Proxy(this, {
            set(target, prop, value) {
                tf.dispose(target[prop])
                target[prop] = value
                return true
            }
        })
    }

    norm() {
        // returns string atm... todo
        return this.map(v => v && tf.norm(v).dataSync()).reduce((val, acc) => val + acc, 0)
    }

    /**
     * 
     * @param {*} i 
     * @param {InputDefinition} def 
     */
    setByDefinition(def, i, normed = true) {
        if (def.locked) return
        const result = generateFromDefinition(def)
        this[i] = normed? result.div(tf.norm(result)) : result
    }

    mul(dir) {
        if (typeof dir === 'number') {
            return this.map(v => v && v.mul(dir))
        }
        else {
            return this.map((v, i) => dir[i] && v && v.mul(dir[i]))
        }
    }

    div(dir) {
        if (typeof dir === 'number') {
            return this.map(v => v && v.div(dir))
        }
        else {
            throw 'not implemented'
        }
    }

    add(dir) {
        if (typeof dir === 'number') {
            return this.map(v => v && v.add(dir))
        }
        else {
            return this.map((v, i) => {
                if (dir[i] && v) return v.add(dir[i])
                else if (dir[i]) return dir[i]
                else return v
            })
        }
    }

    sub(dir) {
        if (typeof dir === 'number') {
            return this.map(v => v && v.sub(dir))
        }
        else {
            return this.map((v, i) => {
                if (dir[i] && v) return v.sub(dir[i])
                else if (dir[i]) return typeof dir[i] === 'number'? -dir[i] : dir[i].mul(-1)
                else return v
            })
        }
    }
}


/**
 * Representing a location in latent space, it is an array of all inputs given into the model.
 */
export class Style extends Array {
    /**
     * @param {Array<InputDefinition>} defs
     * @param {Array<Tensor|Array<number>>} styles
     */
    constructor(defs, styles) {
        super()
        if (!defs) throw 'need to provide style definitions'
        this.defs = defs
        if (styles) {
            styles.forEach((value, i) => {
                this[i] = value
            })
        }
        else if(typeof defs !== 'number') {
            this.generateAll()
        }
    }

    generateAll() {
        this.defs.forEach((def, i) =>  {
            this[i] = generateFromDefinition(def)
        })
    }

    generate(i) {
        this[i] = generateFromDefinition(this.defs[i])
    }

    map(...args) {
        const result = super.map(...args)
        result.defs = this.defs
        return result
    }

    /**
     * 
     * @param {Direction} dir 
     */
    sub(dir) {
        return this.map((val, i) => dir[i]? tf.sub(val, dir[i]) : val.clone())
    }

    /**
     * 
     * @param {Direction} dir 
     */
    add(dir) {
        return this.map((val, i) => dir[i]? tf.add(val, dir[i]) : val.clone())
    }

    expandSingle() {
        return this.map(val => tf.expandDims(val, 0))
    }

    // todo
    expand1d(v, steps = 3) {
        // lspace [steps, 1]
        const lspace = tf.expandDims(tf.linspace(0, 1, steps).mul(v), -1)

        // add styles [1, latentDim] and lspace [steps, 1]
        return this.map(val => tf.add(val, lspace))
    }

    // todo
    expand2d(vx, vy, steps=3, surround=true) {
        const lspace = tf.linspace(surround? -1 : 0, 1, steps)

        return this.map((val, i) => {
            // [steps, 1, latentDim]
            const xlspace = tf.expandDims(tf.expandDims(lspace, -1).mul(tf.expandDims(vx[i], 0)), 1)
            // [1, steps, latentDim]
            const ylspace = tf.expandDims(tf.expandDims(lspace, -1).mul(tf.expandDims(vy[i], 0)), 0)
            // [steps, steps, latentDim]
            const xylspace = tf.add(xlspace, ylspace)

            // add styles [1, 1, latentDim] with above, then flatten to [steps**2, latentDim]
            return tf.reshape(tf.add(tf.expandDims(val, 0), xylspace), [-1, this.latentDim])
        })
    }

    batchExpand2d(vx, vy, positionInfo) {
        return this.map((val, i) => {
            const _vx = vx[i] || tf.zeros(this.defs[i].shape)
            const _vy = vy[i] || tf.zeros(this.defs[i].shape)

            // [batchSize, ...shape]
            const variants = tf.stack(positionInfo.map(([dx, dy]) => tf.add(_vx.mul(dx), _vy.mul(dy))))
            // add styles [1, latentDim] with above -> [batchSize, latentDim]
            return tf.add(tf.expandDims(val, 0), variants)
        })
    }

    arraySync() {
        return this.map(t => t.arraySync())
    }

    static fromData(data) {
        return new this(data.map(d => tf.tensor(d)))
    }
}


export class ImageNoise {
    constructor(tensor) {
        this.tensor = tensor ?? tf.randomUniform([1, 64, 64, 1])
    }

    random() {
        tf.dispose(this)
        this.tensor = tf.randomUniform([1, 64, 64, 1])
    }

    combineWithStyles(styles) {
        let imageNoise
        if (styles[0].shape.length == 2) {
            const zeros = tf.zeros([styles[0].shape[0], 1, 1, 1])
            imageNoise = tf.add(this.tensor, zeros)
        }
        return [
            styles[0],
            styles[1],
            imageNoise,
            styles[2],
            styles[3],
            styles[4]
        ]
    }

    arraySync() {
        return this.tensor.arraySync()
    }

    static fromData(data) {
        return new this(tf.tensor(data))
    }
}