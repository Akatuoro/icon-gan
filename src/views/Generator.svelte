<script>
    import { writable } from 'svelte/store'
    import {onMount} from 'svelte'
    import {explore, proxy} from '../exploration'
    import { saveAs } from 'file-saver';
    import Plane from './exploration/Plane.svelte';
    import Direction from './exploration/Direction.svelte';
    import Palette from './Palette.svelte';

    let scaleSlider
    let exploration

    const scale = writable(0.5)

    scale.subscribe(value => {
        if (!exploration) return
        exploration.scale = value
        exploration.update()
	});

    function onScaleSliderChange(e) {
        scale.set(e.target.value / 10)
    }

    onMount(async () => {
        const _exploration = await explore();
        window.exploration = _exploration

        console.info('loading model')
        await _exploration.preLoad()

        // updates bindings
        exploration = _exploration

        console.info('model loaded, update')
        exploration.update()

        const home = document.getElementById('home')
        home.hidden = true

        const overlay = document.getElementById('overlay')
        overlay.hidden = true
    })
</script>

<style>
    .background {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        background-color: #051A33;
    }

    .sidebar-container {
        position:absolute;
        top: 0px;
        right: 0px;
        height: 100%;
        overflow: scroll;
    }

    .sidebar {
        width: 128px;
        display: flex;
        flex-flow: wrap;
    }

    .palette {
        width: 192px;
        display: flex;
        flex-flow: wrap;
        border: 1px solid #ff9b28;
    }
</style>

<div class="background">
    <Plane scale={scale} exploration={exploration} />
    <input bind:this={scaleSlider} on:input={onScaleSliderChange} type="range" min="1" max="500" value="50" id="scale-slider">
    <button on:click={() => exploration.reset()}>reset</button>

    <div class="palette">
        <Palette {exploration} />
    </div>

    <div class="sidebar-container">
    <div class="sidebar">
        <Direction exploration={exploration} />
    </div>
    </div>
</div>
