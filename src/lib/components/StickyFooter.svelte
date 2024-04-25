<script>
    import { Container } from "@sveltestrap/sveltestrap";

    /**
     * Determines the height of the footer
     * @type {number}
     */
    export let height = 60;

    /**
     * Determines the container type within the footer.
     * @type {'fluid' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'}
     */
    export let container = 'fluid';
    let containerProps = {
        sm: container === 'sm',
        md: container === 'md',
        lg: container === 'lg',
        xl: container === 'xl',
        xxl: container === 'xxl',
        fluid: container === 'fluid'
    };
</script>

<footer class="fixed-bottom" style='--height:{height};'>
    <Container {...containerProps}>
        <slot></slot>
    </Container>
</footer>

<style>
    footer {
        position: fixed;
        /* height: 60px;
        line-height: 60px; */
		/* height : calc( var(--height) * 1px ); */
        height: fit-content;
		line-height : calc( var(--height) * 1px );
        bottom: 0;
        width: 100%;
    }
</style>
