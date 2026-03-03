import type { RequestHandler } from './$types';
import { buildPostTransitionCss, buildProjectTransitionCss } from '$lib/view-transition';

const PROJECT_KEYS = ['ssra', 'good-vibes', 'led'];
const POST_KEYS = ['transformers', 'svelte-5', 'designing-users'];

const css = [buildProjectTransitionCss(PROJECT_KEYS), buildPostTransitionCss(POST_KEYS)].join('\n');

export const GET: RequestHandler = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'public, max-age=300'
	});

	return new Response(css, {
		headers: {
			'content-type': 'text/css; charset=utf-8'
		}
	});
};
