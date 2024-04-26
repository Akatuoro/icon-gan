<script>
    import { Progress } from "@sveltestrap/sveltestrap";

    export let busy = false;
    let busyProgress = busy? 10 : 100
    let busyInterval

    const initBusyInterval = () => {
        return setInterval(() => busyProgress = 90 - (90 - busyProgress) / 100, 100)
    }
    $: if (busy) {
        busyProgress = 10
        busyInterval = initBusyInterval()
    }
    else {
        busyProgress = 100
        clearInterval(busyInterval)
        busyInterval = undefined
    }
</script>

<Progress value={busyProgress} {...$$restProps} />
