<script>
    import { browserSupport } from "./browser-support";

    $: ({ webgl, worker } = $browserSupport ?? {})
    $: (both = webgl && worker)

    const highlighted = (condition) => condition? 'color: #ff9b28' : '';
</script>

<div id="support" hidden={!$browserSupport} style="color: gray; animation: fadein 0.5s;">
    <span style={highlighted(webgl)}>WebGL</span>
    <span style={highlighted(both)}> + </span>
    <span style={highlighted(worker)}>Worker</span>
</div>
