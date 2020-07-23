import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import {terser} from 'rollup-plugin-terser'

const production = !process.env.ROLLUP_WATCH

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'dist/bundle.js',
	},
	plugins: [
		resolve({browser: true}),
		commonjs(),
		production && terser(),
	],
}
