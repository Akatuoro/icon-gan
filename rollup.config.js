import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'

const production = !process.env.ROLLUP_WATCH

export default [{
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'dist/bundle.js',
	},
	plugins: [
		svelte({dev: !production}),
		resolve({browser: true, dedupe: ['svelte']}),
		commonjs(),
		// production && terser(),
	],
}, {
	input: 'src/exploration/worker.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'esm',
		file: 'dist/exploration-worker.js',
	},
	plugins: [
		resolve({browser: true}),
		commonjs(),
		// production && terser(),
	],
}]
