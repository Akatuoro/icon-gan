<script>
    import {onMount} from 'svelte'
    import * as tf from '@tensorflow/tfjs';
    import {getModel, getImageData, toImg, drawImage, getNoise, expandNoise, ImageNoise, Style} from '../model'

    const modelPromise = getModel()

    let canvas
    let scaleSlider



    let n = 3
    let scale = 0.5

    let imageNoise = new ImageNoise()
    let style = new Style()


    let vx = tf.oneHot(1, style.latentDim)
    let vy = tf.oneHot(2, style.latentDim)


    async function onUpdate() {
        const model = await getModel()

        tf.tidy(() => {
            //const exStyle = style.expand1d(scale, n)
            const exStyle = style.expand2d(vx.mul(scale), vy.mul(scale), n)
            //const exNoise = expandNoise(noise, n**2, scale)

            const combined = imageNoise.combineWithStyles(exStyle)

            const tensor = model.execute(combined)

            const ctx = canvas.getContext('2d')
            drawImage(ctx, toImg(tensor, n))
        })
    }

    onMount(async () => {
        await modelPromise


        onUpdate()

        const home = document.getElementById('home')
        home.hidden = true

        const overlay = document.getElementById('overlay')
        overlay.hidden = true



        canvas.addEventListener('wheel', e => {
            e.preventDefault()

            const deltaY = e.deltaY || -e.wheelData

            scale += deltaY / 500

            onUpdate()
        })


        scaleSlider.oninput = e => {
            scale = e.target.value / 10
            onUpdate()
        }
    })
</script>

<style>
    .background {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        background-color: #051A33;
    }
</style>

<div class="background">
    <canvas bind:this={canvas} id="canvas" width={n * 64} height={n * 64}></canvas>
    <input bind:this={scaleSlider} type="range" min="1" max="500" value="50" id="scale-slider">
</div>
