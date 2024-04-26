<script>
    import { Card, Input } from '@sveltestrap/sveltestrap';
import {proxy} from '../../exploration'
import {dragged} from '../../state/dragged'
import {onDestroy} from 'svelte'
    import BusySpinner from '$lib/components/BusySpinner.svelte';
    import ScaleSlider from '$lib/components/ScaleSlider.svelte';

export let exploration

export let scale

export let active

let explorer

let busy

let selected = 0

let directionType = 'randomNormal'


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
    explorer.onBusy = proxy((_busy) => busy = _busy)

    explorer.update()
}

function reset() {
    explorer.generateAll()
    explorer.update()
}

$: if (!explorer && exploration && active) {
    init()
}

onDestroy(async () => {
    const explorer = await explorerPromise
    explorer && explorer.release()
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

<Card body outline>
{#each ['oneHot', 'randomNormal'] as value}
    <label><input type="radio" {value} bind:group={directionType}> {value}</label>
{/each}

{#if directionType === 'oneHot'}
    {#each [0,1,3,4,5] as value}
        <label><input type="radio" {value} bind:group={selected}> {value}</label>
    {/each}
    <ScaleSlider scale={scale} ratio={10} />
{:else}
    <ScaleSlider scale={scale} ratio={10} />
    <button style="width:100%" on:click={() => reset()}>reset</button>
{/if}

</Card>

<Card body outline>
    <div style="position: absolute; top: 10px; left: 10px;">
        <BusySpinner busy={busy || !explorer} time={100} />
    </div>
    <div style="padding: 20px;">
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
</div>
</Card>

<style>
    label {
        color: #ff9b28;
    }
</style>
