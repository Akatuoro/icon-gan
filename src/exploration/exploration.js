import * as tf from '@tensorflow/tfjs';

import {getModel, toImg} from './model'
import {ImageNoise, Style} from './input'
import {BatchGenerator2D, BatchGenerator2DAIO} from './batch'


export class Exploration {
    /**
     * Initializes class. Has to be called exactly once before the class can be used.
     */
    async init({n = 3, scale = 0.5, config, onUpdate} = {}) {
        this.n = n
        this.scale = scale
        this.onUpdate = onUpdate

        this.batchGenerator = new BatchGenerator2DAIO(n, n)

        if (config) {
            this.setConfig(config)
        }
        else {
            this.imageNoise = new ImageNoise()
            this.style = new Style()
    
            this.vx = tf.oneHot(1, this.style.latentDim)
            this.vy = tf.oneHot(2, this.style.latentDim)
        }
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

        tf.dispose(this.imageNoise)
        tf.dispose(this.style)
        tf.dispose(this.vx)
        tf.dispose(this.vy)
        this.imageNoise = ImageNoise.fromData(config.imageNoise)
        this.style = Style.fromData(config.style)
        this.vx = tf.tensor(config.vx)
        this.vy = tf.tensor(config.vy)

        this.batchGenerator.reset(n, n)

        this.update()
    }

    reset() {
        this.imageNoise.random()
        this.style.random()

        //scale = 0.5
        tf.dispose(this.vx)
        tf.dispose(this.vy)
        this.vx = tf.oneHot(1, this.style.latentDim)
        this.vy = tf.oneHot(2, this.style.latentDim)

        this.update()
    }

    moveTo(x, y) {
        const center = (this.n-1)/2
        if (x !== center || y !== center) {
            const dx = x - center / center
            const dy = y - center / center

            this.style = this.style.move(tf.add(
                this.vx.mul(this.scale * dx),
                this.vy.mul(this.scale * dy)))

            this.update()
        }
    }

    /** Initiates model (otherwise lazy loaded in update fn) */
    async preLoad() {
        await getModel()
        return true
    }

    async update() {
        this.batchGenerator.queue(this.queueStep.bind(this))
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
