<script>
    import { Card, Icon, Progress, Spinner } from "@sveltestrap/sveltestrap";
import {proxy} from "../../exploration";
import {dragged} from '../../state/dragged'
import {onDestroy} from 'svelte'
    import BusySpinner from "$lib/components/BusySpinner.svelte";
    import ScaleSlider from "$lib/components/ScaleSlider.svelte";

export let exploration

export let scale

export let active

/** @type {import('../../exploration/plane-exporer.js').PlaneExplorer} */
let explorer
let explorerPromise

let busy = false

let canvas = new Array(3).fill(1).map(() => new Array(3).fill(1))

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
function onCanvasClick(x, y) {
    explorer.moveTo(x, y)
}

async function onCanvasScroll(e) {
    e.preventDefault()

    const deltaY = e.deltaY || -e.wheelData

    scale.update(v => v + deltaY / 500)
}

function handleDragStart(x, y, e) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData('text', 'dragging...')

    dragged.valuePromise = explorer.transferLatent(x, y)
    dragged.imageData = canvas[x][y].getContext('2d').getImageData(0, 0, 64, 64)
    dragged.isTransfer = true
}

function handleDragEnd(e) {
    dragged.clear()
}

async function handleDrop(x, y, e) {
    const {valuePromise, imageData, isTransfer} = dragged
    const v = await valuePromise
    if (isTransfer) explorer.setLatentTransfer(x, y, v)
    else explorer.setLatent(x, y, v)
}

async function init() {
    explorerPromise = exploration.createPlaneExplorer();
    explorer = await explorerPromise
    explorer.onUpdate = proxy(onUpdate)
    explorer.onBusy = proxy((_busy) => busy = _busy)
    window.planeExplorer = explorer

    explorer.update()
}

onDestroy(async () => {
    const explorer = await explorerPromise
    explorer && explorer.release()
})

$: if (!explorer && exploration && active) {
    init()
}

</script>

<style>
    .outer {
        display: grid;
        height: 100%;
        place-items: center;
    }
    .box {
        display: grid;
        grid-template: repeat(3, auto) / repeat(3, auto)
    }
</style>

<Card body outline>
    <ScaleSlider scale={scale} ratio={10} />
    <button style="width:100%" on:click={() => exploration.reset()}>reset</button>
</Card>

<Card body outline>
<div style="position: absolute; top: 10px; left: 10px;">
    <BusySpinner busy={busy || !explorer} time={100} />
</div>
<div class="outer">
<div class="box">
    {#each [0, 1, 2] as x}
        {#each [0, 1, 2] as y}
            <canvas bind:this={canvas[x][y]}
                on:click={onCanvasClick.bind(null, x, y)}
                on:wheel={onCanvasScroll}
                id={`canvas${x}-${y}`}
                width={1 * 64}
                height={1 * 64}
                draggable="true"
                on:dragstart={handleDragStart.bind(null, x, y)}
                on:dragend={handleDragEnd}
                on:drop={handleDrop.bind(null, x, y)}
                ondragover="return false">
            </canvas>
        {/each}
    {/each}
</div>
</div>
</Card>
