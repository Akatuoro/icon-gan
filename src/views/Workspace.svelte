<script>
	import { onMount } from "svelte";
	import Holder from "./Holder.svelte";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { flip } from "svelte/animate";

	const [send, receive] = crossfade({
		duration: 400,
		easing: quintOut,
		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 200,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t};
				`,
			};
		},
	});

	export let elements;
</script>

<div class="outer">
	<header>ICON GAN</header>

	<main>
		<div class="workarea">
			{#each elements.filter((element) => element.expanded) as element (element.name)}
				<div
					class="border holder-with-content"
					in:receive={{ key: element.name }}
					out:send={{ key: element.name }}
					animate:flip={{ duration: 300 }}
				>
					<Holder
						name={element.name}
						bind:expanded={element.expanded}
					/>
					<div>
						<svelte:component this={element.component} {...element.props} />
					</div>
				</div>
			{/each}
		</div>
	</main>
	<div class="right-side">
		<slot name="right-side" />
	</div>
	<footer>
		<div class="footer-left">
			<slot name="footer-left" />
		</div>
		<div class="holders footer-center">
			{#each elements.filter((element) => !element.expanded) as element (element.name)}
				<div
					class="border"
					in:receive={{ key: element.name }}
					out:send={{ key: element.name }}
					animate:flip={{ duration: 300 }}
				>
					<Holder
						name={element.name}
						bind:expanded={element.expanded}
					/>
					<div />
				</div>
			{/each}
		</div>
		<div class="footer-right">
			<slot name="footer-right" />
		</div>
	</footer>
</div>

<style>
	.border {
		border: 1px solid #ff9b28;
		outline: none;
		margin: 5px;
	}

	.holders {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
	}

	.workarea {
		display: grid;
		grid-gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	}

	.holder-with-content {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.outer {
		height: 100%;
		display: grid;
		grid-template: auto 1fr auto / auto 1fr auto;
	}
	header {
		padding: 2rem;
		grid-column: 1 / 4;
		color: #ff9b28;
	}
	.right-side {
		grid-column: 3 / 4;
		height: 100%;
		overflow-y: auto;
	}
	main {
		grid-column: 2 / 3;
	}
	footer {
		grid-column: 1 / 4;
		display: grid;
		grid-gap: 1rem;
		grid-template-columns: auto 1fr auto;
	}

	.footer-right {
		grid-column: 3 / 3;
	}
	.footer-center {
		grid-column: 2 / 2;
	}
	.footer-left {
		grid-column: 1 / 1;
	}
</style>
