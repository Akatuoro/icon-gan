import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';

import {getModel, getImageData, toImg, drawImage, getNoise, expandNoise, ImageNoise, Style} from './model'

const scaleSlider = document.getElementById('scale-slider')

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

let n = 3
let scale = 0.5

let imageNoise = new ImageNoise()
let style = new Style()

//let noise = getNoise()

window.updateNoise = () => {
    //noise = getNoise()
    imageNoise = new ImageNoise()
    style = new Style()
    onUpdate()
}

let vx = tf.oneHot(1, style.latentDim)
let vy = tf.oneHot(2, style.latentDim)


window.updateDirection = () => {
    //vx = tf.oneHot(Math.floor(Math.random() * style.latentDim), style.latentDim)
    //vy = tf.oneHot(Math.floor(Math.random() * style.latentDim), style.latentDim)
    vx = tf.randomUniform([style.latentDim])
    vy = tf.randomUniform([style.latentDim])

    vx = tf.div(vx, tf.norm(vx))
    vy = tf.div(vy, tf.norm(vy))
    onUpdate()
}

async function onUpdate() {
    const model = await getModel()

    tf.tidy(() => {
        //const exStyle = style.expand1d(scale, n)
        const exStyle = style.expand2d(vx.mul(scale), vy.mul(scale), n)
        //const exNoise = expandNoise(noise, n**2, scale)

        const combined = imageNoise.combineWithStyles(exStyle)

        const tensor = model.execute(combined)

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

scaleSlider.oninput = e => {
    scale = e.target.value / 10
    onUpdate()
}
