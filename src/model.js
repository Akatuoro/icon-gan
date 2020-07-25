import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';
import { model } from '@tensorflow/tfjs';

export const MODEL_URL = 'models/logo-10-web/model.json';

let modelPromise

export function getModel() {
    if (!modelPromise) {
        modelPromise = loadGraphModel(MODEL_URL)
    }
    return modelPromise
}

window.getModel = getModel
window.tf = tf


export function toImg(tensor, w) {
    const n = tensor.shape[0]

    const h = n/w

    let d = tf.concat([tensor.clipByValue(0, 1), tf.ones([n, 64, 64, 1])], 3).mul(255)
    d = tf.reshape(d, [w, h, 64, 64, 4])
    d = tf.transpose(d, [1, 2, 0, 3, 4])
    const im_data = new ImageData(new Uint8ClampedArray(d.dataSync()), 64*w, 64*h)

    return im_data
}


export class Style extends Array {
    constructor(styles = 5, latentDim = 512) {
        super()
        if (styles instanceof Array) {
            this.push(...styles)
            this.latentDim = styles[0].shape[1]
        }
        else if (typeof(styles) === 'number') {
            this.latentDim = latentDim
            this.random(styles)
        }
    }

    random(num) {
        if (this.length > 0) {
            tf.dispose(this)
            this.length = 0
        }
        for (let i = 0; i < num; i++) {
            this.push(tf.randomNormal([1, this.latentDim]))
        }
    }

    move(v) {
        return this.map(val => tf.add(val, tf.expandDims(v, 0)))
    }

    expand1d(v, steps = 3) {
        // lspace [steps, 1]
        const lspace = tf.expandDims(tf.linspace(0, 1, steps).mul(v), -1)

        // add styles [1, latentDim] and lspace [steps, 1]
        return this.map(val => tf.add(val, lspace))
    }

    expand2d(vx, vy, steps=3, surround=true) {
        const lspace = tf.linspace(surround? -1 : 0, 1, steps)

        // [steps, 1, 1]
        const xlspace = tf.expandDims(tf.expandDims(lspace, -1).mul(tf.expandDims(vx, 0)), 1)
        // [1, steps, 1]
        const ylspace = tf.expandDims(tf.expandDims(lspace, -1).mul(tf.expandDims(vy, 0)), 0)
        // [steps, steps, 1]
        const xylspace = tf.add(xlspace, ylspace)

        // add styles [1, 1, latentDim] with above, then flatten to [steps**2, latentDim]
        return this.map(val => tf.reshape(tf.add(tf.expandDims(val, 0), xylspace), [-1, this.latentDim]))
    }
}


export class ImageNoise {
    constructor() {
        this.tensor = tf.randomUniform([1, 64, 64, 1])
    }

    random() {
        tf.dispose(this)
        this.tensor = tf.randomUniform([1, 64, 64, 1])
    }

    combineWithStyles(styles) {
        let imageNoise
        if (styles[0].shape.length == 2) {
            const zeros = tf.zeros([styles[0].shape[0], 1, 1, 1])
            imageNoise = tf.add(this.tensor, zeros)
        }
        return [
            styles[0],
            styles[1],
            imageNoise,
            styles[2],
            styles[3],
            styles[4]
        ]
    }
}


export function getNoise() {
    const noise = []

    for (let i = 0; i < 5; i++) noise.push(tf.randomNormal([1, 512]))

    const nImage = tf.randomUniform([1, 64, 64, 1])

    noise.splice(2, 0, nImage)

    return noise
}

export function expandNoise(noise, n, scale) {
    n = n ?? 1
    scale = scale ?? 0.5

    const lspace = tf.expandDims(tf.linspace(0, 1, n).mul(scale), -1)

    const zeros = tf.zeros([n, 1, 1, 1])

    return noise.map((val, i) => tf.add(val, i == 2? zeros : lspace), noise)
}

export function getImageData(model, n, scale) {
    n = n ?? 1
    scale = scale ?? 0.5
    const noise = []

    const lspace = tf.expandDims(tf.linspace(0, 1, n).mul(scale), -1)
    //for (let i = 0; i < 5; i++) noise.push(tf.randomNormal([n, 512]))
    for (let i = 0; i < 5; i++) noise.push(tf.add(tf.randomNormal([1, 512]), lspace))

    //const nImage = tf.randomUniform([n, 64, 64, 1])
    const nImage = tf.add(tf.randomUniform([1, 64, 64, 1]), tf.expandDims(tf.expandDims(lspace, -1), -1))

    noise.splice(2, 0, nImage)

    // correct noise order...

    const result = model.execute(noise)

    return toImg(result)
}


export function drawImage(ctx, im_data) {
    ctx.putImageData(im_data, 0, 0)
}

window.getImageData = getImageData
window.drawImage = drawImage
