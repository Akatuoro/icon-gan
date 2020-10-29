import * as tf from '@tensorflow/tfjs';

import {Explorer} from './explorer'
import {getModel, toImg} from './model'
import {BatchGenerator2DAIO, BatchExecutor} from './batch'
import { transferBay, TransferContainer } from './transfer';

export class PlaneExplorer extends Explorer {
    /**
     * Initializes class. Has to be called exactly once before the class can be used.
     */
    async init({n = 3, config} = {}, central) {
        this.n = n
        this.central = central

        this.batchGenerator = new BatchGenerator2DAIO(n, n)
        this.batchExecutor = new BatchExecutor(this.batchGenerator)

        if (config) {
            this.setConfig(config)
        }
        else {
            this.randomV()
        }
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

    reset() {
        this.randomV()
    }


    randomV() {
        this.vx = tf.oneHot(Math.floor(Math.random() * this.central.style.latentDim), this.central.style.latentDim)
        this.vy = tf.oneHot(Math.floor(Math.random() * this.central.style.latentDim), this.central.style.latentDim)
    }

    moveTo(x, y) {
        const center = (this.n-1)/2
        if (x !== center || y !== center) {
            const dx = x - center / center
            const dy = y - center / center

            this.central.style = tf.tidy(() => this.central.style.move(tf.add(
                this.vx.mul(this.central.scale * dx),
                this.vy.mul(this.central.scale * dy))))

            this.update()
        }
    }

    getLatent(x, y) {
        const center = (this.n-1)/2
        const dx = x - center / center
        const dy = y - center / center

        return this.central.style.move(tf.add(
            this.vx.mul(this.central.scale * dx),
            this.vy.mul(this.central.scale * dy)))
    }

    transferLatent(x, y) {
        return transferBay.push(new TransferContainer(this.getLatent.bind(this, x, y), style => style.arraySync())) - 1
    }

    setLatentTransfer(x, y, transferIndex) {
        const style = tf.tidy(() => transferBay[transferIndex].getValue())
        this.setLatent(x, y, style)
    }

    setLatent(x, y, style) {
        const center = (this.n-1)/2
        if (x !== center || y !== center) {
            const dx = x - center / center
            const dy = y - center / center

            tf.tidy(() =>{
                let v = this.central.style.sub(style)[0].reshape([-1]).div(this.central.scale).mul(-1)

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
            this.central.style = style
        }
        this.update()
    }

    update() {
        this.batchExecutor.iterable = this.batchGenerator
        this.batchExecutor.start(this.queueStep.bind(this))
    }

    async queueStep(positionInfo) {
        const model = await getModel()

        tf.tidy(() => {
            const exStyle = this.central.style.batchExpand2d(
                this.vx.mul(this.central.scale),
                this.vy.mul(this.central.scale),
                positionInfo.map(([x, y]) => [x - (this.n - 1) / 2, y - (this.n - 1) / 2]))

            const combined = this.central.imageNoise.combineWithStyles(exStyle)

            const tensor = model.execute(combined)

            const imageData = toImg(tensor, 1)

            this.onUpdate?.(imageData, positionInfo)
        })
    }

}