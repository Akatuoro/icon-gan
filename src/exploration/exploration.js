import * as tf from '@tensorflow/tfjs';

import {getModel, toImg} from './model'
import {ImageNoise, Style} from './input'



export class Exploration {
    /**
     * Initializes class. Has to be called exactly once before the class can be used.
     */
    async init({n, scale, config, onUpdate} = {n: 3, scale: 0.5}) {
        this.n = n
        this.scale = scale
        this.onUpdate = onUpdate

        this.updateQueue = []
        this.queueTS = undefined
        console.log('init', this)

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
        tf.dispose(this.updateQueue)
        this.updateQueue.length = 0

        const exStyle = this.style.expand2d(
            this.vx.mul(this.scale),
            this.vy.mul(this.scale),
            this.n)

        this.updateQueue.push(exStyle)

        if (!this.queueTS) {
            this.queueTS = setTimeout(() => this.queueStep())
        }
    }

    async queueStep() {
        const model = await getModel()
        const exStyle = this.updateQueue.shift()

        tf.tidy(() => {
            const combined = this.imageNoise.combineWithStyles(exStyle)
    
            const tensor = model.execute(combined)
    
            const imageData = toImg(tensor, this.n)
    
            this.onUpdate?.(imageData)
        })

        tf.dispose(exStyle)

        if (this.updateQueue.length > 0) {
            this.queueTS = setTimeout(() => this.queueStep())
        }
        else {
            this.queueTS = undefined
        }
    }
}
