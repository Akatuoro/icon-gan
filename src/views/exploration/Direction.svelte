<script>
import {proxy} from '../../exploration'
import {dragged} from '../../state/dragged'
import {onDestroy} from 'svelte'

export let exploration

let explorer

let selected = 0

let directionType = 'oneHot'

import * as tf from '@tensorflow/tfjs'
window.tf = tf

let n = 40

let sideIndices = new Array(n)

let canvas = []

function onSideUpdate(imageData, positionInfo) {
    const j = positionInfo
    if (!canvas[j]) return
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

let explorerPromise

async function init() {
    explorerPromise = exploration.createDirectionExplorer({n})
    explorer = await explorerPromise
    window.directionExplorer = explorer

    explorer.onUpdate = proxy(onSideUpdate)

    explorer.update()
}

function reset() {
    explorer.generateAll()
    explorer.update()
}

$: if (!explorer && exploration) {
    init()
}

onDestroy(async () => {
    const explorer = await explorerPromise
    explorer.release()
})

$: if (selected !== undefined && directionType !== undefined && explorer) {
    explorer.type = directionType
    explorer.dims = directionType === 'randomNormal'? [0,1,2,3,4,5] : [selected]
    const n = directionType === 'randomNormal'? 40 : 80
    sideIndices = new Array(n)
    explorer.n = n
    explorer.generateAll()
    explorer.update()
}

</script>

{#each ['oneHot', 'randomNormal'] as value}
    <label><input type="radio" {value} bind:group={directionType}> {value}</label>
{/each}

{#if directionType === 'oneHot'}
    {#each [0,1,3,4,5] as value}
        <label><input type="radio" {value} bind:group={selected}> {value}</label>
    {/each}
{:else}
    <button style="width:100%" on:click={() => reset()}>reset</button>
{/if}

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

<style>
    label {
        color: #ff9b28;
    }
</style>
