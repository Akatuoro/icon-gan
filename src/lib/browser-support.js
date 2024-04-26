import { readable } from "svelte/store";
import { browser } from '$app/environment';

let support;

export function getBrowserSupport() {
    if (!browser) return;
    if (support) return support;

    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')

    support = {
        worker: !!window.Worker,
        webgl: gl && gl instanceof WebGLRenderingContext,
        offscreen: !!window.OffscreenCanvas
    }
    return support;
}

export const browserSupport = readable(null, (set) => set(getBrowserSupport()));
