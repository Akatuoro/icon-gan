import * as tf from '@tensorflow/tfjs';

import {Explorer} from './explorer'
import {getModel, toImg} from './model'
import {BatchExecutor} from './batch'
import { transferBay, TransferContainer } from './transfer';
import { Direction } from './input';

export class DirectionExplorer extends Explorer {
    init({n = 9} = {}, central) {
        this.n = n

        this.dims = central.style.map((_, i) => i)

        /** @type {'oneHot' | 'randomNormal'} */
        this.type = 'oneHot'

        this.central = central

        this.generateAll()

        this.batchExecutor = new BatchExecutor()

        this.onRelease(() => {
            this.batchExecutor.stop()
            this.v = undefined
        })
    }

    set v(v) {
        if (this.v) {
            this.v.forEach(tf.dispose)
        }
        tf.dispose(this.v)
        this._v = v
    }

    get v() {
        return this._v
    }

    generateAll() {
        const v = []

        for (let i = 0; i < this.n; i++) {
            v[i] = new Direction()
            this.dims.forEach(j => {
                const def = this.central.style.defs[j]
                if (def.shape && def.shape.length === 1) {
                    if (this.type === 'oneHot') {
                        v[i][j] = tf.oneHot(i, def.shape[0])
                    }
                    if (this.type === 'randomNormal') {
                        v[i].setByDefinition({generationType: 'randomNormal', shape: def.shape}, j, true)
                    }
                }
                else {
                    v[i].setByDefinition(def, j)
                }
            })
        }

        this.v = v
    }

    getV(i) {
        return this.v[i].map(vec => vec.arraySync())
    }

    getLatent(i) {
        return this.central.style.add(this.v[i].mul(this.central.scale))
    }

    transferLatent(i) {
        return transferBay.push(new TransferContainer(this.getLatent.bind(this, i), style => style.arraySync())) - 1
    }

    update() {
        this.onBusy?.(true)
        this.batchExecutor.iterable = this.v.map((_, i) => i);
        this.batchExecutor.start(this.queueStep.bind(this), () => this.onBusy?.(false))
    }

    async queueStep(positionInfo) {
        const model = await getModel()

        tf.tidy(() => {
            const exStyle = this.central.style.add(this.v[positionInfo].mul(this.central.scale)).expandSingle()

            const tensor = model.execute(exStyle)

            const imageData = toImg(tensor, 1)

            this.onUpdate?.(imageData, positionInfo)
        })
    }
}
