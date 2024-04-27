<script>
    import './global.scss'
    import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink, Container } from '@sveltestrap/sveltestrap'
    import '../../node_modules/bootstrap-icons/font/bootstrap-icons.css'
    import { base } from '$app/paths'

    let isOpen
</script>


<Navbar expand="lg" container="fluid">
    <NavbarBrand href='{base}/'>ICON GAN</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse expand="lg" {isOpen} navbar on:update={(event) => (isOpen = event.detail.isOpen)}>
        <Nav class="ms-auto" navbar>
            <NavItem>
                <NavLink href='{base}/model'>Model</NavLink>
            </NavItem>
            <NavItem>
                <NavLink href='{base}/about'>About</NavLink>
            </NavItem>
            <NavItem>
                <a class='nav-link' target="_blank" rel="noopener noreferrer" href='https://github.com/Akatuoro/icon-gan'>GitHub</a>
            </NavItem>
        </Nav>
    </Collapse>
</Navbar>

<Container fluid style="padding-top: 1rem;">
    <slot></slot>
</Container>
