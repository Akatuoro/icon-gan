<script>
    import LoadingGrid from "$lib/components/LoadingGrid.svelte";
    import BrowserSupport from "$lib/browser-support.svelte";
    import FancyButton from "$lib/components/FancyButton.svelte";
    import StickyFooter from "$lib/components/StickyFooter.svelte";
    import { base } from "$app/paths";

    function load() {
        location.href = base + '/model'
    }
</script>

<div id="home">
    <div class="main-container">

        <h1 style="margin-bottom: 5rem;">Icon GAN</h1>
        <FancyButton on:click={load} >
            <span>LOAD<br><span style="font-size: 12px;">(16MB)</span></span>
        </FancyButton>
    </div>
</div>

<StickyFooter>
    <div>
        <div style="float: left;">
            <BrowserSupport />
        </div>
        <div style="float: right;">
            License: CC-BY-NC
        </div>
    </div>
</StickyFooter>

<div id="overlay" hidden="true" onclick="reset()">
    <div class="container">
        <LoadingGrid/>
    </div>
</div>


<style>

    #home {
        padding-top: 10rem;
        width: 100%;
        background-position: center;
        justify-content: center;
        align-items: center;
        display: grid;
    }

    .main-container {
        height: fit-content;
        width: fit-content;
        justify-content: center;
    }

    .container {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

</style>
