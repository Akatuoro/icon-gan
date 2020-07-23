import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';

export const MODEL_URL = 'models/logo-10-web/model.json';


export const modelPromise = loadGraphModel(MODEL_URL);

window.modelPromise = modelPromise
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
