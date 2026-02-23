import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import {
	HERO_SUBTITLE_MAX_LENGTH,
	HOME_CONTENT_ID,
	StartQuoteDocSchema,
	sanitizeHeroSubtitle,
	startQuoteDocToJson
} from '$lib/content/hero';
import { loadNormalizedHomeContent } from '$lib/server/home-content';
import type { PageServerLoad } from './$types';

const SAVE_FLASH_COOKIE_NAME = 'admin_saved_flash';

const UpdateStartQuoteSchema = z.object({
	startQuoteDoc: z.string().min(1).max(20000),
	heroSubtitle: z.string().max(HERO_SUBTITLE_MAX_LENGTH * 3)
});

export const load: PageServerLoad = async ({ cookies }) => {
	const justSaved = cookies.get(SAVE_FLASH_COOKIE_NAME) === '1';

	if (justSaved) {
		cookies.delete(SAVE_FLASH_COOKIE_NAME, { path: '/admin' });
	}

	const { homeContent, startQuoteDoc, startQuoteDocJson, heroSubtitle } =
		await loadNormalizedHomeContent();

	return {
		startQuoteDoc,
		startQuoteDocJson,
		heroSubtitle,
		justSaved,
		heroSubtitleMaxLength: HERO_SUBTITLE_MAX_LENGTH,
		updatedAt: homeContent.updatedAt.toISOString()
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsedForm = UpdateStartQuoteSchema.safeParse(formData);

		if (!parsedForm.success) {
			return fail(400, { error: 'Invalid start quote content.' });
		}

		let parsedDoc: unknown;

		try {
			parsedDoc = JSON.parse(parsedForm.data.startQuoteDoc);
		} catch {
			return fail(400, { error: 'Start quote payload is not valid JSON.' });
		}

		const parsedStartQuoteDoc = StartQuoteDocSchema.safeParse(parsedDoc);

		if (!parsedStartQuoteDoc.success) {
			return fail(400, { error: 'Start quote payload failed validation.' });
		}

		const startQuoteDoc = startQuoteDocToJson(parsedStartQuoteDoc.data);
		const heroSubtitle = sanitizeHeroSubtitle(parsedForm.data.heroSubtitle);

		await prisma.homeContent.upsert({
			where: { id: HOME_CONTENT_ID },
			update: {
				startQuoteDoc,
				heroSubtitle
			},
			create: {
				id: HOME_CONTENT_ID,
				startQuoteDoc,
				heroSubtitle
			}
		});

		cookies.set(SAVE_FLASH_COOKIE_NAME, '1', {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			path: '/admin',
			maxAge: 60
		});

		throw redirect(303, '/admin');
	}
};
