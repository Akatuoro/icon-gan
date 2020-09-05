import * as tf from '@tensorflow/tfjs';

export class Style extends Array {
    constructor(styles = 5, latentDim = 512) {
        super()
        if (styles instanceof Array) {
            this.push(...styles)
            this.latentDim = styles[0].shape[1]
        }
        else if (typeof(styles) === 'number') {
            this.latentDim = latentDim
            this.random(styles)
        }
    }

    random(num=5) {
        if (this.length > 0) {
            tf.dispose(this)
            this.length = 0
        }
        for (let i = 0; i < num; i++) {
            this.push(tf.randomNormal([1, this.latentDim]))
        }
    }

    move(v) {
        return this.map(val => tf.add(val, tf.expandDims(v, 0)))
    }

    expand1d(v, steps = 3) {
        // lspace [steps, 1]
        const lspace = tf.expandDims(tf.linspace(0, 1, steps).mul(v), -1)

        // add styles [1, latentDim] and lspace [steps, 1]
        return this.map(val => tf.add(val, lspace))
    }

    expand2d(vx, vy, steps=3, surround=true) {
        const lspace = tf.linspace(surround? -1 : 0, 1, steps)

        // [steps, 1, 1]
        const xlspace = tf.expandDims(tf.expandDims(lspace, -1).mul(tf.expandDims(vx, 0)), 1)
        // [1, steps, 1]
        const ylspace = tf.expandDims(tf.expandDims(lspace, -1).mul(tf.expandDims(vy, 0)), 0)
        // [steps, steps, 1]
        const xylspace = tf.add(xlspace, ylspace)

        // add styles [1, 1, latentDim] with above, then flatten to [steps**2, latentDim]
        return this.map(val => tf.reshape(tf.add(tf.expandDims(val, 0), xylspace), [-1, this.latentDim]))
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