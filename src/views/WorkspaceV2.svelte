

<script>
    import StickyFooter from "$lib/components/StickyFooter.svelte";
    import { Button, Collapse, Icon, TabContent } from "@sveltestrap/sveltestrap";
    import WorkspaceTab from "./WorkspaceTab.svelte";


	export let elements;

    let isOpen = true;
</script>


<TabContent tabindex={1}>
    {#each elements as element}
        <WorkspaceTab element={element} />
    {/each}
</TabContent>

<StickyFooter container="fluid">
    <Collapse isOpen={isOpen} class="accordion-collapse" on:introstart on:introend on:outrostart on:outroend>
        <slot name="right-side"></slot>
    </Collapse>
    <div style="display:flex; overflow:auto; justify-content: center;">
        <Button on:click={() => isOpen = !isOpen}>
            <Icon name={isOpen? 'chevron-down' : 'chevron-up'} />
            Palette
        </Button>
    </div>
</StickyFooter>
