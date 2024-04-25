<script>
    import { palette } from '$lib/state/palette';
    import { onMount } from 'svelte';


import {dragged} from '../state/dragged'

export let exploration

let canvas = []



function handleDragStart(i, e) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData('text', JSON.stringify($palette[i]?.value))
    dragged.valuePromise = $palette[i]?.value
    dragged.imageData = canvas[i].getContext('2d').getImageData(0, 0, 64, 64)
    dragged.isTransfer = false
}

function handleDragEnd(e) {
    dragged.clear()
}

async function handleDrop(i, e) {
    const {valuePromise, imageData, isTransfer} = dragged
    const v = await valuePromise

    const value = isTransfer? await exploration.resolveTransfer(v) : v;

    $palette[i] = { value, imageData };

    if (imageData) {
        canvas[i].getContext('2d').putImageData(imageData, 0, 0)
    }
}

onMount(() => {
    $palette.forEach((data, i) => {
        if (data?.imageData) {
            canvas[i].getContext('2d').putImageData(data.imageData, 0, 0);
        }
    })
})

</script>


{#each ($palette ?? []) as slot, i}
<canvas class="border"
    bind:this={canvas[i]}
    width={64}
    height={64}
    draggable={!!slot}
    on:dragstart={handleDragStart.bind(null, i)}
    on:dragend={handleDragEnd}
    on:drop={handleDrop.bind(null, i)}
    ondragover="return false">
</canvas>
{/each}

<style>
	.border {
		border: 1px solid #ff9b28;
		outline: none;
		margin: 5px;
	}
</style>
