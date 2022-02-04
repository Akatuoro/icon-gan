import * as tf from '@tensorflow/tfjs';

import { getModel, toImg } from './model'
import { BatchExecutor } from './batch'
import { transferBay, TransferContainer } from './transfer';

import { BatchGenerator1D } from './batch';
import { Explorer } from './explorer';
import { Direction } from './input';

export class InterpolationExplorer extends Explorer {
	init({ n = 9 } = {}, central) {
		this.n = n

		this.central = central
		this.v = new Direction()

		this.batchGenerator = new BatchGenerator1D(n)
		this.batchExecutor = new BatchExecutor()

		this.onRelease(() => {
			this.batchExecutor.stop()
			this.source = undefined;
			this.target = undefined;
			this.v = undefined
		})
	}

	set n(n) {
		if (n !== this.n) this.batchGenerator = new BatchGenerator1D(this.n)
		this._n = n
	}

	get n() {
		return this._n
	}

	set v(v) {
		tf.dispose(this.v);
		this._v = v
	}

	get v() {
		return this._v
	}


	getLatent(i) {
		return this.central.style.add(this.v.mul(i / (this.n - 1)))
	}

	transferLatent(i) {
		return transferBay.push(new TransferContainer(this.getLatent.bind(this, i), style => style.arraySync())) - 1
	}

	setLatentTransfer(i, transferIndex) {
		const style = tf.tidy(() => transferBay[transferIndex].getValue())
		this.setLatent(i, style)
	}

	setLatent(i, style) {
		tf.tidy(() => {
			this.central.style.sub(style).forEach((val, j) => {
				this.v[j] = val.mul(-1);
				tf.keep(this.v[j]);
			})
		})
		this.update()
	}

	update() {
		this.batchExecutor.iterable = this.batchGenerator;
		this.batchExecutor.start(this.queueStep.bind(this))
	}

	async queueStep(i) {
		const model = await getModel()

		tf.tidy(() => {
			const exStyle = this.central.style.add(this.v.mul(i / (this.n - 1))).expandSingle()

			const tensor = model.execute(exStyle)

			const imageData = toImg(tensor, 1)

			this.onUpdate?.(imageData, i)
		})
	}
}
