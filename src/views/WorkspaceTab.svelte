<script>
    import { Container, TabPane } from "@sveltestrap/sveltestrap";
    import { getContext } from "svelte";

    export let element

    const { activeTabId, setActiveTab } = getContext('tabContent');
    let active = element.active;
    $: if ($activeTabId !== undefined) active = $activeTabId === element.name;

    if (element.active) setActiveTab(element.name)
</script>

<TabPane tabId={element.name} tab={element.name}>
    <Container lg style="padding: 1rem;">
        <svelte:component this={element.component} active={active} {...element.props} />
    </Container>
</TabPane>
