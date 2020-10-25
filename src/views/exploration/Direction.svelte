<script>
import {proxy} from '../../exploration'
import {dragged} from '../../state/dragged'

export let exploration

let explorer

const n = 128

const sideIndices = new Array(n)

let sideCanvas = []

function onSideUpdate(imageData, positionInfo) {
    const i = 0
    const j = positionInfo
    const sideCtx = sideCanvas[j].getContext('2d')
    const x = 0//j % 3
    const y = 0//(j - x) / 3
    sideCtx.putImageData(imageData, x * 64 - i * 64, y * 64, i * 64, 0, 64, 64)
}

async function handleDragStart(i, e) {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData('text', 'dragging...')
    dragged.valuePromise = explorer.transferLatent(i)
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
</script>

{#each sideIndices as _, i}
    <canvas
        bind:this={sideCanvas[i]}
        id={`sideCanvas${i}`}
        width={1 * 64}
        height={1 * 64}
        draggable=true
        on:dragstart={handleDragStart.bind(null, i)}>
    </canvas>
{/each}
