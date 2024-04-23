

<div id="home">
    <div class="container">
        <div class="container-content" style="position: absolute;">
            <div class="header">
                <div style="text-align: left;"><noscript>Enable JavaScript!</noscript></div>
                <div></div>
                <div style="text-align: right;">
                    <div id="support" hidden style="color: gray; animation: fadein 0.5s;">
                        <span id="webgl">WebGL</span>
                        <span id="plus"> + </span>
                        <span id="worker">Worker</span>
                    </div>
                </div>
            </div>

            <h1>Icon GAN</h1>
            <div class="flex-center btn-container">
                <div style="position: absolute;">
                    <button class="btn" onclick="load()">
                        <svg width="180px" height="60px" viewBox="0 0 180 60" class="border">
                            <polyline points="179,1 179,59 1,59 1,1 179,1" class="bg-line" />
                            <polyline points="179,1 179,59 1,59 1,1 179,1" class="hl-line" />
                        </svg>
                        <span>LOAD<br><span>(16MB)</span></span>
                    </button>
                </div>
            </div>

            <div class="footer">
                <div style="text-align: left;"><a href="https://github.com/Akatuoro/icon-gan">GitHub</a></div>
                <div style="text-align: center;"><a onclick="document.getElementById('aboutDialog').showModal()">About</a></div>
                <div style="text-align: right;">License: CC-BY-NC</div>
            </div>
        </div>
    </div>
</div>
<div id="overlay" hidden="true" onclick="reset()">
    <div class="container">
        <div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    </div>
</div>
<dialog id="aboutDialog" onclick="dialogCloseHandler(event)">
    <p>Icon GAN is a <a href="https://en.wikipedia.org/wiki/Generative_adversarial_network">generative adversarial network</a> for interactively generating favicons.</p>
    <p>
        Usually designers work together with clients to iterate on icon designs, presenting drafts and iterating on the final design.
        This icon generator can help provide inspiration to the artist and client or serve as base for the iterative process.
    </p>
    <p>The interface facilitates exploring the latent space of the trained model. It features exploring a 2d subspace and selectively choosing directions - representing style and form -, interpolating between 2 or 3 icons and moving generated icons and their respective latent space representations between different tools via drag & drop.</p>
    <br>
    <menu>
        <button onclick="document.getElementById('aboutDialog').close()">Close</button>
    </menu>
</dialog>
