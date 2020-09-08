<script>
    import {onMount} from 'svelte'
    import {explore} from '../exploration'
    import { saveAs } from 'file-saver';
import { image } from '@tensorflow/tfjs';


    let canvas
    let scaleSlider

    $: ctx = canvas && canvas.getContext('2d')

    let n = 3
    let scale = 0.5

    function onUpdate(imageData, positionInfo) {

        if (!positionInfo) {
            ctx.putImageData(imageData, 0, 0)
            return
        }
        positionInfo.forEach(([x, y], i) => {
            ctx.putImageData(imageData, x * 64 - i * 64, y * 64, i * 64, 0, 64, 64)
        })
    }

    let explorer

    window.getConfig = () => explorer.getConfig()

    window.setConfig = config => {
        explorer.setConfig(config)

        explorer.update()
    }

    window.saveConfig = () => {
        const config = explorer.getConfig()

        const json = JSON.stringify(config)
        const file = new File([json], 'icon.icon-def', {type: "text/plain;charset=utf-8"})
        saveAs(file)
    }


    function onCanvasClick(e) {
        const x = Math.floor(e.offsetX / 64)
        const y = Math.floor(e.offsetY / 64)

        explorer.moveTo(x, y)
    }

    async function onCanvasScroll(e) {
        e.preventDefault()

        const deltaY = e.deltaY || -e.wheelData

        scale += deltaY / 500
        explorer.scale = scale

        explorer.update()
    }

    function onScaleSliderChange(e) {
        scale = e.target.value / 10

        explorer.scale = scale
        explorer.update()
    }

    onMount(async () => {
        explorer = await explore({onUpdate});

        console.log('loading model')
        await explorer.preLoad()

        console.log('model loaded, update')
        explorer.update()

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

    <button on:click={() => explorer.reset()}>reset</button>
</div>
