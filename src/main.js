import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';

import {modelPromise, getImageData, toImg, drawImage, getNoise, expandNoise} from './model'



const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let n = 5
let scale = 0.5

let noise = getNoise()

window.updateNoise = () => {
    noise = getNoise()
    onUpdate()
}

async function onUpdate() {
    const model = await modelPromise

    tf.tidy(() => {
        const exNoise = expandNoise(noise, n**2, scale)
    
        const tensor = model.execute(exNoise)
    
        drawImage(ctx, toImg(tensor, n))
    })
}


canvas.addEventListener('wheel', e => {
    e.preventDefault()

    const deltaY = e.deltaY ?? -e.wheelData

    scale += deltaY / 500

    onUpdate()
})

onUpdate()
