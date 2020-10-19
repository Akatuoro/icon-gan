import * as tf from '@tensorflow/tfjs';

import {getModel, toImg} from './model'
import {BatchExecutor} from './batch'

export class DirectionExplorer {
    init(options, central) {
        this.n = options.n

        this.central = central

        this.batchDef = []
        this.v = []

        for (let i = 0; i < this.n; i++) {
            this.batchDef.push(i)
            this.v.push(tf.oneHot(i, central.style.latentDim))
        }

        this.batchExecutor = new BatchExecutor()
    }

    getV(i) {
        return this.v[i].arraySync()
    }

    async update() {
        this.batchExecutor.iterable = this.batchDef
        this.batchExecutor.start(this.queueStep.bind(this))
    }

    async queueStep(positionInfo) {
        const model = await getModel()

        tf.tidy(() => {
            const exStyle = this.central.style.move(this.v[positionInfo].mul(this.central.scale))

            const combined = this.central.imageNoise.combineWithStyles(exStyle)

            const tensor = model.execute(combined)

            const imageData = toImg(tensor, 1)

            this.onUpdate?.(imageData, positionInfo)
        })
    }
}
