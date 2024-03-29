<script>
    import { writable } from 'svelte/store'
    import {onMount} from 'svelte'
    import {explore} from '../exploration'
    import { saveAs } from 'file-saver';
    import Plane from './exploration/Plane.svelte';
    import Direction from './exploration/Direction.svelte';
    import Palette from './Palette.svelte';
    import { dragged } from '../state/dragged';
    import Workspace from './Workspace.svelte';
    import Interpolation from './exploration/Interpolation.svelte';
    import GlobalSettings from './exploration/GlobalSettings.svelte';

    let exploration

    const scale = writable(0.5)

    scale.subscribe(value => {
        if (!exploration) return
        exploration.scale = value
        exploration.update()
	});

    async function handleDownloadDrop() {
        const {imageData} = dragged

        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 64
        const ctx = canvas.getContext('2d')
        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(blob => saveAs(blob, "icon.png"))
    }

    onMount(async () => {
        const _exploration = await explore();

        console.info('loading model')
        await _exploration.preLoad()

        // updates bindings
        exploration = _exploration
        elements.forEach((element) => element.props.exploration = exploration);
        elements = [...elements];

        console.info('model loaded, update')
        exploration.update()

        const home = document.getElementById('home')
        home.hidden = true

        const overlay = document.getElementById('overlay')
        overlay.hidden = true
    })

    let elements = [{
        name: "Plane Explorer",
        component: Plane,
        expanded: true,
        props: { exploration, scale }
    },
    {
        name: "Direction Explorer",
        component: Direction,
        expanded: false,
        props: { exploration }
    },
    {
        name: "Interpolation Explorer",
        component: Interpolation,
        expanded: false,
        props: { exploration }
    },
    {
        name: "Global Settings",
        component: GlobalSettings,
        expanded: true,
        props: { exploration, scale }
    }]
</script>


<Workspace {elements} >
    <div style="display:grid;" slot="right-side">
        <Palette {exploration} />
    </div>

    <div slot="footer-right" class="download-drop"
        on:drop={handleDownloadDrop}
        ondragover="return false">
    </div>
</Workspace>

<style>
    .download-drop {
        height: 64px;
        width: 64px;
        border: 1px dashed #ff9b28;
    }
</style>
