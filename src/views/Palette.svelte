<script>

import {dragged} from '../state/dragged'

export let exploration

let canvas = []

const n = 9

let slots = new Array(n)

window.slots = slots

function handleDragStart(i, e) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData('text', JSON.stringify(slots[i]))
    dragged.valuePromise = slots[i]
    dragged.imageData = canvas[i].getContext('2d').getImageData(0, 0, 64, 64)
    dragged.isTransfer = false
}

function handleDragEnd(e) {
    dragged.clear()
}

async function handleDrop(i, e) {
    const {valuePromise, imageData, isTransfer} = dragged
    const v = await valuePromise

    if (isTransfer) slots[i] = await exploration.resolveTransfer(v)
    else slots[i] = v

    if (imageData) {
        canvas[i].getContext('2d').putImageData(imageData, 0, 0)
    }

    slots = slots
}


</script>


{#each slots as slot, i}
<canvas
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
