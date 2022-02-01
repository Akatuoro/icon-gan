<script>
	export let expanded = false;
	export let name;
</script>

<form class="clickable">
	<label><input type="checkbox" bind:checked={expanded} />{name}</label>
</form>

<style>

	form {
		padding: 1rem;
	}

	label {
		font-size: 1.5rem;
		line-height: 1.5rem;
		padding: 1rem;
		color: #ff9b28;
		cursor: pointer;
	}
	[type="checkbox"] {
		z-index: 0;
		-webkit-appearance: none;
	}

	.clickable {
		transition: 0.5s ease-in-out;
		background: transparent;
		cursor: pointer;
	}
	.clickable:hover {
		transition: 0.5s ease-in-out;
		background: #ff9b2821;
	}
</style>
