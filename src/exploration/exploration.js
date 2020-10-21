import * as tf from '@tensorflow/tfjs';

import {getModel, toImg} from './model'
import {ImageNoise, Style} from './input'
import {BatchGenerator2D, BatchGenerator2DAIO, BatchExecutor} from './batch'
import {exposed} from './exposed'
import { DirectionExplorer } from './direction-explorer';
import { transferBay } from './transfer';


class Central {
    get style() {
        return this._styleFn()
    }

    set style(fn) {
        this._styleFn = fn
    }

    get imageNoise() {
        return this._imageNoiseFn()
    }

    set imageNoise(fn) {
        this._imageNoiseFn = fn
    }

    get scale() {
        return this._scale()
    }

    set scale(fn) {
        this._scale = fn
    }
}

export class Exploration {
    /**
     * Initializes class. Has to be called exactly once before the class can be used.
     */
    async init({n = 3, scale = 0.5, config, onUpdate} = {}) {
        this.n = n
        this.scale = scale
        this.onUpdate = onUpdate

        this.batchGenerator = new BatchGenerator2DAIO(n, n)
        this.batchExecutor = new BatchExecutor(this.batchGenerator)

        if (config) {
            this.setConfig(config)
        }
        else {
            this.imageNoise = new ImageNoise()
            this.style = new Style()

            this.randomV()
        }
    }

    createDirectionExplorer(options) {
        const directionExplorer = new DirectionExplorer()
        this.directionExplorer = directionExplorer

        const central = new Central()
        central.style = () => this.style
        central.imageNoise = () => this.imageNoise
        central.scale = () => this.scale
        directionExplorer.init(options, central)

        return exposed.proxy(directionExplorer)
    }

    get imageNoise() {
        return this._imageNoise
    }

    /**
     * Sets imageNoise and disposes of old imageNoise.
     * @param {ImageNoise || Array} noise
     */
    set imageNoise(noise) {
        this._imageNoise && tf.dispose(this._imageNoise)
        this._imageNoise = noise instanceof ImageNoise?
            noise :
            ImageNoise.fromData(noise)
    }

    get style() {
        return this._style
    }

    /**
     * Sets style and disposes of old style.
     * @param {Style || Array} style
     */
    set style(style) {
        this._style && tf.dispose(this._style)
        this._style = style instanceof Style?
            style :
            Style.fromData(style)
    }

    get vx() {
        return this._vx
    }

    /**
     * Sets vx and disposes of old vx.
     * @param {tf.Tensor || Array} vx
     */
    set vx(vx) {
        this._vx && tf.dispose(this._vx)
        this._vx = vx instanceof tf.Tensor?
            vx :
            tf.tensor(vx)
    }

    get vy() {
        return this._vy
    }

    /**
     * Sets vy and disposes of old vy.
     * @param {tf.Tensor || Array} vy
     */
    set vy(vy) {
        this._vy && tf.dispose(this._vy)
        this._vy = vy instanceof tf.Tensor?
            vy :
            tf.tensor(vy)
    }


    randomV() {
        this.vx = tf.oneHot(Math.floor(Math.random() * this.style.latentDim), this.style.latentDim)
        this.vy = tf.oneHot(Math.floor(Math.random() * this.style.latentDim), this.style.latentDim)
    }

    getConfig() {
        const config = {
            style: this.style.arraySync(),
            imageNoise: this.imageNoise.arraySync(),
            vx: this.vx.arraySync(),
            vy: this.vy.arraySync(),
            scale: this.scale,
            n: this.n
        }

        return config
    }

    setConfig(config) {
        this.n = config.n
        this.scale = config.scale
        this.imageNoise = config.imageNoise
        this.style = config.style
        this.vx = config.vx
        this.vy = config.vy

        this.batchGenerator = new BatchGenerator2DAIO(this.n, this.n)

        this.update()
    }

    reset() {
        this.imageNoise.random()
        this.style.random()

        //scale = 0.5
        this.randomV()

        this.update()
    }

    moveTo(x, y) {
        const center = (this.n-1)/2
        if (x !== center || y !== center) {
            const dx = x - center / center
            const dy = y - center / center

            this.style = tf.tidy(() => this.style.move(tf.add(
                this.vx.mul(this.scale * dx),
                this.vy.mul(this.scale * dy))))

            this.update()
        }
    }

    async setLatent(x, y, transferIndex) {
        const style = tf.tidy(() => transferBay[transferIndex].getValue())
        const center = (this.n-1)/2
        if (x !== center || y !== center) {
            const dx = x - center / center
            const dy = y - center / center

            tf.tidy(() =>{
                let v = this.style.sub(style)[0].reshape([-1]).div(this.scale).mul(-1)

                if (dx === 0) {
                    this.vy = v.mul(dy)
                }
                else if (dy === 0) {
                    this.vx = v.mul(dx)
                }
                else {
                    const fix = this.vx.mul(-dx).add(this.vy.mul(dy))

                    this.vy = v.add(fix).div(2 * dy)
                    this.vx = v.sub(fix).div(2 * dx)
                }

                tf.keep(this.vx)
                tf.keep(this.vy)
            })
        }
        else {
            this.style = style
        }
        this.update()
    }

    /** Initiates model (otherwise lazy loaded in update fn) */
    async preLoad() {
        await getModel()
        return true
    }

    async update() {
        this.batchExecutor.iterable = this.batchGenerator
        this.batchExecutor.start(this.queueStep.bind(this))
        this.directionExplorer && this.directionExplorer.update()
    }

    async queueStep(positionInfo) {
        const model = await getModel()

        tf.tidy(() => {
            const exStyle = this.style.batchExpand2d(
                this.vx.mul(this.scale),
                this.vy.mul(this.scale),
                positionInfo.map(([x, y]) => [x - (this.n - 1) / 2, y - (this.n - 1) / 2]))

            const combined = this.imageNoise.combineWithStyles(exStyle)

            const tensor = model.execute(combined)

            const imageData = toImg(tensor, 1)

            this.onUpdate?.(imageData, positionInfo)
        })
    }
}
