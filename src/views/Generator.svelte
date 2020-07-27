<script>
    import {onMount} from 'svelte'
    import * as tf from '@tensorflow/tfjs';
    import {getModel, getImageData, toImg, drawImage, getNoise, expandNoise, ImageNoise, Style} from '../model'
    import { saveAs } from 'file-saver';


    const modelPromise = getModel()

    let canvas
    let scaleSlider



    let n = 3
    let scale = 0.5

    let imageNoise = new ImageNoise()
    let style = new Style()


    let vx = tf.oneHot(1, style.latentDim)
    let vy = tf.oneHot(2, style.latentDim)

    window.getConfig = () => {
        const config = {
            style: style.arraySync(),
            imageNoise: imageNoise.arraySync(),
            vx: vx.arraySync(),
            vy: vy.arraySync(),
            scale,
            n
        }

        return config
    }

    window.setConfig = config => {
        n = config.n
        scale = config.scale

        tf.dispose(imageNoise)
        tf.dispose(style)
        tf.dispose(vx)
        tf.dispose(vy)
        imageNoise = ImageNoise.fromData(config.imageNoise)
        style = Style.fromData(config.style)
        vx = tf.tensor(config.vx)
        vy = tf.tensor(config.vy)

        onUpdate()
    }

    window.saveConfig = () => {
        const config = getConfig()

        const json = JSON.stringify(config)
        const file = new File([json], 'icon.icon-def', {type: "text/plain;charset=utf-8"})
        saveAs(file)
    }

    function reset() {
        imageNoise.random()
        style.random()

        //scale = 0.5
        tf.dispose(vx)
        tf.dispose(vy)
        vx = tf.oneHot(1, style.latentDim)
        vy = tf.oneHot(2, style.latentDim)

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

            const ctx = canvas.getContext('2d')
            drawImage(ctx, toImg(tensor, n))
        })
    }


    function onCanvasClick(e) {
        const x = Math.floor(e.offsetX / 64)
        const y = Math.floor(e.offsetY / 64)

        const center = (n-1)/2

        if (x !== center || y !== center) {
            const dx = x - center / center
            const dy = y - center / center
            style = style.move(tf.add(vx.mul(scale * dx), vy.mul(scale * dy)))

            onUpdate()
        }
    }

    function onCanvasScroll(e) {
        e.preventDefault()

        const deltaY = e.deltaY || -e.wheelData

        scale += deltaY / 500

        onUpdate()
    }

    function onScaleSliderChange(e) {
        scale = e.target.value / 10
        onUpdate()
    }

    onMount(async () => {
        await modelPromise


        onUpdate()

        const home = document.getElementById('home')
        home.hidden = true

        const overlay = document.getElementById('overlay')
        overlay.hidden = true
    })
</script>

<style>
    .background {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        background-color: #051A33;
    }
</style>

<div class="background">
    <canvas bind:this={canvas} on:click={onCanvasClick} on:wheel={onCanvasScroll} id="canvas" width={n * 64} height={n * 64}></canvas>
    <input bind:this={scaleSlider} on:input={onScaleSliderChange} type="range" min="1" max="500" value="50" id="scale-slider">

    <button on:click={reset}>reset</button>
</div>
