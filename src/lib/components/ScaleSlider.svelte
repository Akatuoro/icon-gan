<script>
    import { Input } from "@sveltestrap/sveltestrap";

    export let scale;
    export let ratio;

    let internalScale = scale * ratio ?? 1;


    function onChange(e) {
        scale.set(e.target.value / ratio);
    }
</script>

<Input type="range" min="1" max="500" bind:value={internalScale} on:change={onChange} />
