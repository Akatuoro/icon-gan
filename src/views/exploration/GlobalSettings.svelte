<script>
    export let exploration;
    export let scale;
    let scaleSlider;

    function onScaleSliderChange(e) {
        scale.set(e.target.value / 10);
    }
</script>

<div class="outer">
    <input
        bind:this={scaleSlider}
        on:input={onScaleSliderChange}
        type="range"
        min="1"
        max="500"
        value="50"
        id="scale-slider"
    />
    <button on:click={() => exploration.reset()}>reset</button>
</div>

<style>
    .outer {
        display: grid;
        height: 100%;
        place-items: center;
    }
</style>
