import type { PageServerLoad } from './$types';
import { docToRenderTokens } from '$lib/content/home-content-render';
import { loadNormalizedHomeContent } from '$lib/server/home-content';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	const [{ startQuoteDoc, heroSubtitle, aboutSection }, projects, blogs] = await Promise.all([
		loadNormalizedHomeContent(),
		prisma.project.findMany({
			where: { visible: true },
			orderBy: { createdAt: 'asc' },
			select: {
				slug: true,
				title: true,
				subtitle: true,
				year: true,
				bannerImgUrl: true,
				technology: true
			}
		}),
		prisma.blog.findMany({
			where: { publishedAt: { lte: new Date() } },
			orderBy: { publishedAt: 'desc' },
			select: { slug: true, title: true, publishedAt: true }
		})
	]);

	return {
		startQuoteTokens: docToRenderTokens(startQuoteDoc),
		heroSubtitle,
		aboutSection,
		projects,
		blogs
	};
};
