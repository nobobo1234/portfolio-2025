import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Adding tailwind processing for Tipex styling.
	plugins: [tailwindcss(), sveltekit()]
});
