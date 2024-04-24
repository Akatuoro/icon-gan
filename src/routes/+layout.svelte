<script>
    import './global.scss'
    import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, NavLink } from '@sveltestrap/sveltestrap'

    let isOpen
</script>


<Navbar expand="lg" container="fluid">
    <NavbarBrand href='/'>ICON GAN</NavbarBrand>
    <NavbarToggler on:click={() => (isOpen = !isOpen)} />
    <Collapse expand="lg" {isOpen} navbar on:update={(event) => (isOpen = event.detail.isOpen)}>
        <Nav class="ms-auto" navbar>
            <NavItem>
                <NavLink href='/model'>Model</NavLink>
            </NavItem>
            <NavItem>
                <NavLink href='/about'>About</NavLink>
            </NavItem>
        </Nav>
    </Collapse>
</Navbar>


<slot></slot>
