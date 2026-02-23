import type { PageServerLoad } from './$types';
import { docToRenderTokens } from '$lib/content/hero';
import { loadNormalizedHomeContent } from '$lib/server/home-content';

export const load: PageServerLoad = async () => {
	const { startQuoteDoc, heroSubtitle } = await loadNormalizedHomeContent();

	return {
		startQuoteTokens: docToRenderTokens(startQuoteDoc),
		heroSubtitle
	};
};
