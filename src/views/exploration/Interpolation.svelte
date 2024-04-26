<script>
	import { proxy } from "../../exploration";
	import { dragged } from "../../state/dragged";
	import { onDestroy } from "svelte";

	export let exploration;

	export let active;

	/** @type {import('../../exploration/plane-exporer.js').InterpolationExplorer} */
	let explorer;
	let explorerPromise;

	let n = 5;
	let m = 5;

	let canvas = new Array(n).fill(1).map(() => new Array(m).fill(1))
	let xs = [];
	for (let i = 0; i < n; i++) {
		xs.push(i);
	}
	let ys = [];
	for (let j = 0; j < m; j++) {
		ys.push(j);
	}

	function onUpdate(imageData, positionInfo) {
		if (!positionInfo) {
			ctx.putImageData(imageData, 0, 0)
			return
		}
		positionInfo.forEach(([x, y], i) => {
			if (!canvas[x] || !canvas[x][y]) return;
			const ctx = canvas[x][y].getContext('2d')
			ctx.putImageData(imageData, 0 * 64 - i * 64, 0 * 64, i * 64, 0, 64, 64)
		})
	}

	function download() {
        const target = document.createElement('canvas')
        target.width = n * 64
        target.height = m * 64
        const ctx = target.getContext('2d')

		for (let x = 0; x < n; x++) {
			for (let y = 0; y < m; y++) {
				const sourceCtx = canvas[x][y].getContext('2d')
				const imageData = sourceCtx.getImageData(0, 0, 64, 64)
				ctx.putImageData(imageData, x * 64, y * 64)
			}
		}

        target.toBlob(blob => saveAs(blob, "icon-interpolation.png"))
	}

	function handleDragStart(x, y, e) {
		e.dataTransfer.dropEffect = "move";
		e.dataTransfer.setData("text", "dragging...");

		dragged.valuePromise = explorer.transferLatent(x, y);
		dragged.imageData = canvas[x][y]
			.getContext("2d")
			.getImageData(0, 0, 64, 64);
		dragged.isTransfer = true;
	}

	function handleDragEnd(e) {
		dragged.clear();
	}

	async function handleDrop(x, y, e) {
		const { valuePromise, imageData, isTransfer } = dragged;
		const v = await valuePromise;
		if (isTransfer) explorer.setLatentTransfer(x, y, v);
		else explorer.setLatent(x, y, v);
	}

	async function init() {
		explorerPromise = exploration.createInterpolationExplorer({n, m});
		explorer = await explorerPromise;
		explorer.onUpdate = proxy(onUpdate);
		window.interpolationExplorer = explorer;

		explorer.update();
	}

	onDestroy(async () => {
		const explorer = await explorerPromise;
		explorer && explorer.release();
	});

	$: if (!explorer && exploration && active) {
		init();
	}
</script>


<div class="outer">
	<div class="toolbar">
		<button on:click={() => download()}>download</button>
	</div>
<div class="inner">
	<div class="box">
		{#each ys as y}
		<div class="box2">
			{#each xs as x}
				<canvas
					bind:this={canvas[x][y]}
					id={`interpolation-canvas-${x}-${y}`}
					width={1 * 64}
					height={1 * 64}
					draggable="true"
					on:dragstart={handleDragStart.bind(null, x, y)}
					on:dragend={handleDragEnd}
					on:drop={handleDrop.bind(null, x, y)}
					ondragover="return false"
				/>
			{/each}
		</div>
		{/each}
	</div>
</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-direction: row-reverse;
	}

	.outer {
		display: block;
		height: 100%;
		width: 100%;
	}
	.inner {
		display: grid;
		place-items: center;
	}
	.box {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
	}

	.box2 {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
	}
</style>
