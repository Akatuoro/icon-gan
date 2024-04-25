import { readable, writable } from "svelte/store";

const n = 9;
const arr = new Array(n);

export const palette = writable( arr );
