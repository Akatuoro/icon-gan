<script>
    import {onMount} from 'svelte'
    import {explore, proxy} from '../exploration'
    import { saveAs } from 'file-saver';
import { image } from '@tensorflow/tfjs';


    let canvas = new Array(3).fill(1).map(() => new Array(3).fill(1))
    let scaleSlider

    let sideCanvas = []

    function onSideUpdate(imageData, positionInfo) {
        const i = 0
        const j = positionInfo
        const sideCtx = sideCanvas[j].getContext('2d')
        const x = 0//j % 3
        const y = 0//(j - x) / 3
        sideCtx.putImageData(imageData, x * 64 - i * 64, y * 64, i * 64, 0, 64, 64)
    }



    let n = 3
    let scale = 0.5

    function onUpdate(imageData, positionInfo) {
        if (!positionInfo) {
            ctx.putImageData(imageData, 0, 0)
            return
        }
        positionInfo.forEach(([x, y], i) => {
            const ctx = canvas[x][y].getContext('2d')
            ctx.putImageData(imageData, 0 * 64 - i * 64, 0 * 64, i * 64, 0, 64, 64)
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


    function onCanvasClick(x, y) {
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

    let directionExplorer

    onMount(async () => {
        explorer = await explore({onUpdate});
        window.explorer = explorer

        console.log('loading model')
        await explorer.preLoad()

        console.log('model loaded, update')
        explorer.update()


        directionExplorer = await explorer.createDirectionExplorer({n: 9})

        directionExplorer.onUpdate = proxy(onSideUpdate)

        directionExplorer.update()


        const home = document.getElementById('home')
        home.hidden = true

        const overlay = document.getElementById('overlay')
        overlay.hidden = true
    })

    const sideIndices = new Array(9)

    let dragged

    async function handleDragStart(i, e) {
        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData('text', 'huhu')
        dragged = {
            valuePromise: directionExplorer.transferLatent(i)
        }
    }

    async function handleDrop(x, y, e) {
        const t = e.dataTransfer.getData('text')

        const v = await dragged.valuePromise
        explorer.setLatent(x, y, v)
    }
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

    .canvas-row {
        display: flex;
    }
</style>

<div class="background">
    {#each [0, 1, 2] as x}
        <div class="canvas-row">
        {#each [0, 1, 2] as y}
            <canvas bind:this={canvas[x][y]} on:click={onCanvasClick.bind(null, x, y)} on:wheel={onCanvasScroll} id={`canvas${x}-${y}`} width={1 * 64} height={1 * 64}
            on:drop={handleDrop.bind(null, x, y)}
            ondragover="return false"></canvas>
        {/each}
        </div>
    {/each}
    <input bind:this={scaleSlider} on:input={onScaleSliderChange} type="range" min="1" max="500" value="50" id="scale-slider">

    {#each sideIndices as _, i}
        <canvas bind:this={sideCanvas[i]} id={`sideCanvas${i}`} width={1 * 64} height={1 * 64}
        draggable=true
        on:dragstart={handleDragStart.bind(null, i)}></canvas>
    {/each}

    <button on:click={() => explorer.reset()}>reset</button>
</div>
