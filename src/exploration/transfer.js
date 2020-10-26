import * as tf from '@tensorflow/tfjs';


class TransferBay extends Array {
    clear() {
        this.length = 0
    }
}

export const transferBay = new TransferBay()

export class TransferContainer {
    constructor(valueCb, evalCb) {
        this.valueCb = valueCb
        this.evalCb = evalCb
    }

    getValue() {
        return this.valueCb()
    }

    evaluate() {
        const value = this.valueCb()
        return this.evalCb? this.evalCb(value) : value
    }
}
