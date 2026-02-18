import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),

	kit: {
        // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({ out: 'build', port: 4800 }),
		env: {
			dir: './'
		},
		alias: {
			'$components': 'src/components'
		},
		csrf: {
			// Enforce same-origin for form actions to prevent CSRF.
			checkOrigin: true
		},
		csp: {
			// Nonce-based CSP for SvelteKit-managed scripts.
			mode: 'nonce',
			directives: {
				'default-src': ['self'],
				'base-uri': ['self'],
				'script-src': ['self'],
				'style-src': ['self'],
				'img-src': ['self', 'data:'],
				'object-src': ['none'],
				'frame-ancestors': ['none'],
				'form-action': ['self']
			}
		}
	}
};

export default config;
