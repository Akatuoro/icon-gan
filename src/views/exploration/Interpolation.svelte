<script>
	import { proxy } from "../../exploration";
	import { dragged } from "../../state/dragged";
	import { onDestroy } from "svelte";

	export let exploration;

	/** @type {import('../../exploration/plane-exporer.js').InterpolationExplorer} */
	let explorer;
	let explorerPromise;

	let n = 30;

	let canvas = [];
	let positions = [];
	for (let i = 0; i < n; i++) {
		positions.push(i);
	}

	function onUpdate(imageData, positionInfo) {
		const j = positionInfo;
		if (!canvas[j]) return;
		const ctx = canvas[j].getContext("2d");
		ctx.putImageData(imageData, 0, 0);
	}

	function handleDragStart(i, e) {
		e.dataTransfer.dropEffect = "move";
		e.dataTransfer.setData("text", "dragging...");

		dragged.valuePromise = explorer.transferLatent(i);
		dragged.imageData = canvas[i]
			.getContext("2d")
			.getImageData(0, 0, 64, 64);
		dragged.isTransfer = true;
	}

	function handleDragEnd(e) {
		dragged.clear();
	}

	async function handleDrop(i, e) {
		const { valuePromise, imageData, isTransfer } = dragged;
		const v = await valuePromise;
		if (isTransfer) explorer.setLatentTransfer(i, v);
		else explorer.setLatent(i, v);
	}

	async function init() {
		explorerPromise = exploration.createInterpolationExplorer({n});
		explorer = await explorerPromise;
		explorer.onUpdate = proxy(onUpdate);
		window.interpolationExplorer = explorer;

		explorer.update();
	}

	onDestroy(async () => {
		const explorer = await explorerPromise;
		explorer && explorer.release();
	});

	$: if (!explorer && exploration) {
		init();
	}
</script>

<div class="outer">
	<div class="box">
		{#each positions as i}
			<canvas
				bind:this={canvas[i]}
				id={`interpolation-canvas-${i}`}
				width={1 * 64}
				height={1 * 64}
				draggable="true"
				on:dragstart={handleDragStart.bind(null, i)}
				on:dragend={handleDragEnd}
				on:drop={handleDrop.bind(null, i)}
				ondragover="return false"
			/>
		{/each}
	</div>
</div>

<style>
	.outer {
		display: grid;
		height: 100%;
		place-items: center;
	}
	.box {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
