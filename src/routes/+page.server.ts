import type { PageServerLoad } from './$types';
import { docToRenderTokens } from '$lib/content/home-content-render';
import { loadNormalizedHomeContent } from '$lib/server/home-content';

export const load: PageServerLoad = async () => {
	const { startQuoteDoc, heroSubtitle, aboutSection } = await loadNormalizedHomeContent();

	return {
		startQuoteTokens: docToRenderTokens(startQuoteDoc),
		heroSubtitle,
		aboutSection
	};
};
