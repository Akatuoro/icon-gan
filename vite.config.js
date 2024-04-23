import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	base: '/icon-gan/',
	server: {
		fs: {
			allow: ['models']
		}
	}
});
