<script>

</script>

<button class="btn1" on:click {...$$restProps}>
    <svg width="180px" height="60px" viewBox="0 0 180 60">
        <polyline points="179,1 179,59 1,59 1,1 179,1" class="bg-line" />
        <polyline points="179,1 179,59 1,59 1,1 179,1" class="hl-line" />
    </svg>
    <slot></slot>
</button>

<style>
    svg {
        position: absolute;
        left: 0;
        top: 0;
        fill: none;
        stroke: #ff9b28;
        stroke-dasharray: 150 480;
        stroke-dashoffset: 150;
        transition: 1s ease-in-out;
    }
    .btn1 {
        width: 180px;
        height: 60px;
        font-size: 18px;
        font-weight: 100;
    }

    .btn1:hover svg {
        stroke-dashoffset: -480;
    }

    button {
        border: 1px solid #ff9b28;
        background-color: #051A33;
        color: #ff9b28;
        cursor: pointer;
        background: transparent;
        outline: none;
        transition: 1s ease-in-out;
    }

    button:hover {
        transition: 1s ease-in-out;
        background: #ff9b2821;
    }
</style>
