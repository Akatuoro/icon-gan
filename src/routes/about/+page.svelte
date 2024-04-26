<script>
    import { Card } from "@sveltestrap/sveltestrap";
</script>

<Card style="padding: 2rem;">
    <p>Icon GAN is a <a href="https://en.wikipedia.org/wiki/Generative_adversarial_network">generative adversarial network</a> for interactively generating favicons.</p>
    <p>
        Usually designers work together with clients to iterate on icon designs, presenting drafts and iterating on the final design.
        This icon generator can help provide inspiration to the artist and client or serve as base for the iterative process.
    </p>
    <p>The interface facilitates exploring the latent space of the trained model. It features exploring a 2d subspace and selectively choosing directions - representing style and form -, interpolating between 2 or 3 icons and moving generated icons and their respective latent space representations between different tools via drag & drop.</p>
    <br>
</Card>
