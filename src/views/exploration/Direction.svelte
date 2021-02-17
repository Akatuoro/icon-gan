<script>
import {proxy} from '../../exploration'
import {dragged} from '../../state/dragged'

export let exploration

let explorer

let selected = 0

import * as tf from '@tensorflow/tfjs'
window.tf = tf

const n = 128

const sideIndices = new Array(n)

let canvas = []

function onSideUpdate(imageData, positionInfo) {
    const j = positionInfo
    const ctx = canvas[j].getContext('2d')
    ctx.putImageData(imageData, 0, 0)
}

async function handleDragStart(i, e) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData('text', 'dragging...')

    dragged.valuePromise = explorer.transferLatent(i)
    dragged.imageData = canvas[i].getContext('2d').getImageData(0, 0, 64, 64)
    dragged.isTransfer = true
}

function handleDragEnd(e) {
    dragged.clear()
}

async function init() {
    explorer = await exploration.createDirectionExplorer({n})
    window.directionExplorer = explorer

    explorer.onUpdate = proxy(onSideUpdate)

    explorer.update()
}

$: if (!explorer && exploration) {
    init()
}

$: if (selected !== undefined && explorer) {
    explorer.dims = [selected]
    explorer.generateAll()
    explorer.update()
}
</script>

{#each [0,1,2,3,4,5] as value}
	<label><input type="radio" {value} bind:group={selected}> {value}</label>
{/each}

{#each sideIndices as _, i}
    <canvas
        bind:this={canvas[i]}
        id={`sideCanvas${i}`}
        width={64}
        height={64}
        draggable=true
        on:dragstart={handleDragStart.bind(null, i)}
        on:dragend={handleDragEnd}>
    </canvas>
{/each}
