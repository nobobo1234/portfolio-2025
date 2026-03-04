import {
	DEFAULT_ABOUT_SECTION,
	DEFAULT_HERO_SUBTITLE,
	DEFAULT_START_QUOTE_DOC,
	HOME_CONTENT_ID
} from '$lib/content/home-content-schema';
import {
	parseStartQuoteDoc,
	sanitizeAboutSection,
	sanitizeHeroSubtitle,
	startQuoteDocToJson
} from '$lib/content/home-content-normalize';
import { prisma } from '$lib/server/prisma';

const DEFAULT_START_QUOTE_DOC_JSON = startQuoteDocToJson(DEFAULT_START_QUOTE_DOC);

export async function loadNormalizedHomeContent() {
	const homeContent = await prisma.homeContent.findUnique({
		where: { id: HOME_CONTENT_ID }
	});

	const rawStartQuoteDoc = homeContent?.startQuoteDoc ?? DEFAULT_START_QUOTE_DOC_JSON;
	const rawHeroSubtitle = homeContent?.heroSubtitle ?? DEFAULT_HERO_SUBTITLE;
	const rawAboutSection = homeContent?.aboutSection ?? DEFAULT_ABOUT_SECTION;
	const photoUrl = homeContent?.photoUrl ?? null;

	const startQuoteDoc = parseStartQuoteDoc(rawStartQuoteDoc);
	const startQuoteDocJson = startQuoteDocToJson(startQuoteDoc);
	const heroSubtitle = sanitizeHeroSubtitle(rawHeroSubtitle);
	const aboutSection = sanitizeAboutSection(rawAboutSection);

	return {
		startQuoteDoc,
		startQuoteDocJson,
		heroSubtitle,
		aboutSection,
		photoUrl
	};
}
