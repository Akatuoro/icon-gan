import * as tf from '@tensorflow/tfjs';

import { getModel, toImg } from './model'
import { BatchExecutor, BatchGenerator2DAIO } from './batch'
import { transferBay, TransferContainer } from './transfer';

import { Explorer } from './explorer';
import { Direction, Style } from './input';

export class InterpolationExplorer extends Explorer {
	init({ n = 9, m = 9 } = {}, central) {
		this.n = n
		this.m = m

		this.central = central
		this.A = central.style.clone()
		this.B = central.style.clone()
		this.C = central.style.clone()
		this.vb = new Direction()
		this.vc = new Direction()

		this.batchGenerator = new BatchGenerator2DAIO(n, m)
		this.batchExecutor = new BatchExecutor()

		this.onRelease(() => {
			this.batchExecutor.stop()
		})
	}

	set n(n) {
		if (n !== this.n) this.batchGenerator = new BatchGenerator2DAIO(this.n, this.m)
		this._n = n
	}

	get n() {
		return this._n
	}

	set m(m) {
		if (m !== this.m) this.batchGenerator = new BatchGenerator2DAIO(this.n, this.m)
		this._m = m
	}

	get m() {
		return this._m
	}


	getLatent(x, y = 0) {
		return this.A.add(this.vb.mul(x / (this.n - 1))).add(this.vc.mul(y / (this.m - 1)))
	}

	transferLatent(x, y = 0) {
		return transferBay.push(new TransferContainer(this.getLatent.bind(this, x, y), style => style.arraySync())) - 1
	}

	setLatentTransfer(x, y, transferIndex) {
		const style = tf.tidy(() => transferBay[transferIndex].getValue())
		this.setLatent(x, y, style)
	}

	setLatent(x, y, style) {
		if (x === 0 && y === 0) {
			tf.dispose(this.A)
			this.A = Style.from(style)
		}
		else if (x > y) {
			tf.tidy(() => {
				this.A.sub(style).forEach((val, j) => {
					this.vb[j] = val.mul(-1);
					tf.keep(this.vb[j]);
				})
			})
		}
		else {
			tf.tidy(() => {
				this.A.sub(style).forEach((val, j) => {
					this.vc[j] = val.mul(-1);
					tf.keep(this.vc[j]);
				})
			})
		}
		this.update()
	}

	update() {
		this.batchExecutor.iterable = this.batchGenerator;
		this.batchExecutor.start(this.queueStep.bind(this))
	}

	async queueStep(positionInfo) {
		const model = await getModel()

		tf.tidy(() => {
            const exStyle = this.A.batchExpand2d(
                this.vb,
                this.vc,
                positionInfo.map(([x, y]) => [x / this.n, y / this.m]))

			const tensor = model.execute(exStyle)

			const imageData = toImg(tensor, 1)

			this.onUpdate?.(imageData, positionInfo)
		})
	}
}
