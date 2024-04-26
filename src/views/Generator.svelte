<script>
    import { writable } from 'svelte/store'
    import {onMount} from 'svelte'
    import fileSaver from 'file-saver';
    import Plane from './exploration/Plane.svelte';
    import Direction from './exploration/Direction.svelte';
    import Palette from './Palette.svelte';
    import { dragged } from '../state/dragged';
    import Workspace from './Workspace.svelte';
    import Interpolation from './exploration/Interpolation.svelte';
    import GlobalSettings from './exploration/GlobalSettings.svelte';
    import WorkspaceV2 from './WorkspaceV2.svelte';
    import { ExplorationManager } from '$lib/state/global';
    const { saveAs } = fileSaver;

    let exploration

    const scale = writable(25)

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
        const _exploration = await ExplorationManager.explore();

        // updates bindings
        exploration = _exploration
        elements.forEach((element) => element.props.exploration = exploration);
        elements = [...elements];

        exploration.scale = $scale
        console.info('model loaded, update')
        exploration.update()
    })

    let elements = [{
        name: "Plane",
        component: Plane,
        active: true,
        expanded: true,
        props: { exploration, scale }
    },
    {
        name: "Direction",
        component: Direction,
        expanded: false,
        props: { exploration, scale }
    },
    {
        name: "Interpolation",
        component: Interpolation,
        expanded: false,
        props: { exploration }
    },
    // {
    //     name: "Global Settings",
    //     component: GlobalSettings,
    //     expanded: true,
    //     props: { exploration, scale }
    // }
    ]
</script>


<WorkspaceV2 {elements} >
    <div style="display:flex; overflow:auto; justify-content: center;" slot="right-side">
        <Palette {exploration} />
    </div>

    <div role="region" slot="footer-right" class="download-drop"
        on:drop={handleDownloadDrop}
        ondragover="return false">
    </div>
</WorkspaceV2>

<style>
    .download-drop {
        height: 64px;
        width: 64px;
        border: 1px dashed #ff9b28;
    }
</style>
