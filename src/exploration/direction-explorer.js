import * as tf from '@tensorflow/tfjs';

import {Explorer} from './explorer'
import {getModel, toImg} from './model'
import {BatchExecutor} from './batch'
import { transferBay, TransferContainer } from './transfer';

export class DirectionExplorer extends Explorer {
    init({n = 9} = {}, central) {
        this.n = n

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

    getLatent(i) {
        return this.central.style.move(this.v[i].mul(this.central.scale))
    }

    transferLatent(i) {
        return transferBay.push(new TransferContainer(this.getLatent.bind(this, i), style => style.arraySync())) - 1
    }

    update() {
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
