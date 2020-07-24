<script>
    import {onMount, onDestroy} from 'svelte'
    import Generator from './views/Generator.svelte'


    let currentHash

    function onHashChange() {
        currentHash = decodeURIComponent(window.location.hash)

        if (currentHash === '') {
            const home = document.getElementById('home')
            home.hidden = false
        }
    }

    onMount(() => {
        onHashChange()
        window.addEventListener('hashchange', onHashChange)
    })

    onDestroy(() => {
        window.removeEventListener('hashchange', onHashChange)
    })

</script>


{#if currentHash === "#model"}
    <Generator />
{/if}
