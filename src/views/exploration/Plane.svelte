<script>
import {proxy} from "../../exploration";
import {dragged} from '../../state/dragged'

export let exploration

export let scale

let explorer


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

async function handleDrop(x, y, e) {
    const t = e.dataTransfer.getData('text')

    const v = await dragged.valuePromise
    explorer.setLatent(x, y, v)
}

async function init() {
    explorer = await exploration.createPlaneExplorer()
    explorer.onUpdate = proxy(onUpdate)
    window.planeExplorer = explorer

    explorer.update()
}

$: if (!explorer && exploration) {
    init()
}

</script>

<style>
    .canvas-row {
        display: flex;
    }
</style>

{#each [0, 1, 2] as x}
    <div class="canvas-row">
        {#each [0, 1, 2] as y}
            <canvas bind:this={canvas[x][y]}
                on:click={onCanvasClick.bind(null, x, y)}
                on:wheel={onCanvasScroll}
                id={`canvas${x}-${y}`}
                width={1 * 64}
                height={1 * 64}
                on:drop={handleDrop.bind(null, x, y)}
                ondragover="return false">
            </canvas>
        {/each}
    </div>
{/each}
