import {
	DEFAULT_HERO_SUBTITLE,
	DEFAULT_START_QUOTE_DOC,
	HOME_CONTENT_ID,
	sanitizeHeroSubtitle,
	startQuoteDocToJson,
	parseStartQuoteDoc
} from '$lib/content/hero';
import { prisma } from '$lib/server/prisma';

export async function getOrCreateHomeContent() {
	return prisma.homeContent.upsert({
		where: { id: HOME_CONTENT_ID },
		update: {},
		create: {
			id: HOME_CONTENT_ID,
			startQuoteDoc: startQuoteDocToJson(DEFAULT_START_QUOTE_DOC),
			heroSubtitle: DEFAULT_HERO_SUBTITLE
		}
	});
}

export async function loadNormalizedHomeContent() {
	const homeContent = await getOrCreateHomeContent();
	const startQuoteDoc = parseStartQuoteDoc(homeContent.startQuoteDoc);
	const startQuoteDocJson = startQuoteDocToJson(startQuoteDoc);
	const heroSubtitle = sanitizeHeroSubtitle(homeContent.heroSubtitle);

	const needsUpdate =
		startQuoteDocJson !== homeContent.startQuoteDoc || heroSubtitle !== homeContent.heroSubtitle;
	const persistedHomeContent = needsUpdate
		? await prisma.homeContent.update({
				where: { id: HOME_CONTENT_ID },
				data: {
					startQuoteDoc: startQuoteDocJson,
					heroSubtitle
				}
			})
		: homeContent;

	return {
		homeContent: persistedHomeContent,
		startQuoteDoc,
		startQuoteDocJson,
		heroSubtitle
	};
}
