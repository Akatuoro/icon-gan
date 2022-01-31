import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';

export const MODEL_URL = 'https://raw.githubusercontent.com/Akatuoro/nn-models/master/icons-64-web/model.json';
//'/models/icons-64-web/model.json';

let modelPromise

/** @returns {Promise<tf.GraphModel>} */
export function getModel() {
    if (!modelPromise) {
        modelPromise = loadGraphModel(MODEL_URL)
    }
    return modelPromise
}

export function toImg(tensor, h) {
    const n = tensor.shape[0]

    const w = n/h

    let d = tf.concat([tensor.clipByValue(0, 1), tf.ones([n, 64, 64, 1])], 3).mul(255)
    d = tf.reshape(d, [w, h, 64, 64, 4])
    d = tf.transpose(d, [1, 2, 0, 3, 4])
    const im_data = new ImageData(new Uint8ClampedArray(d.dataSync()), 64*w, 64*h)

    return im_data
}
