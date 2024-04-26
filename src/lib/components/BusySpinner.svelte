<script>
    import { Icon, Spinner } from "@sveltestrap/sveltestrap";


    export let busy = false;

    export let time = 200;

    let spin = busy;

    let timer;

    $: if (busy === spin && timer) {
        clearTimeout(timer)
        timer = undefined
    }
    else if (busy !== spin && !timer) {
        timer = setTimeout(() => {
            spin = busy
            timer = undefined
        }, time)
    }
</script>
{#if spin}
<Spinner size="sm" {...$$restProps} />
{:else}
<Icon name="check-circle" />
{/if}
