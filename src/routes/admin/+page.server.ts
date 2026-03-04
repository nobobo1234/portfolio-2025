import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import {
	ABOUT_SECTION_MAX_LENGTH,
	DEFAULT_ABOUT_SECTION,
	DEFAULT_HERO_SUBTITLE,
	DEFAULT_START_QUOTE_DOC,
	HERO_SUBTITLE_MAX_LENGTH,
	HOME_CONTENT_ID,
	StartQuoteDocSchema
} from '$lib/content/home-content-schema';
import {
	sanitizeAboutSection,
	sanitizeHeroSubtitle,
	startQuoteDocToJson
} from '$lib/content/home-content-normalize';
import { loadNormalizedHomeContent } from '$lib/server/home-content';
import type { PageServerLoad } from './$types';

const SAVE_FLASH_COOKIE_NAME = 'admin_saved_flash';
type SavedSection = 'start-quote' | 'about' | 'photo';

const UpdateStartQuoteSchema = z.object({
	startQuoteDoc: z.string().min(1).max(20000),
	heroSubtitle: z.string().max(HERO_SUBTITLE_MAX_LENGTH * 3)
});

const UpdateAboutSchema = z.object({
	aboutSection: z.string().max(ABOUT_SECTION_MAX_LENGTH * 3)
});

function setSaveFlashCookie(
	cookies: Parameters<PageServerLoad>[0]['cookies'],
	savedSection: SavedSection
) {
	cookies.set(SAVE_FLASH_COOKIE_NAME, savedSection, {
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		path: '/admin',
		maxAge: 60
	});
}

export const load: PageServerLoad = async ({ cookies }) => {
	const savedSection = cookies.get(SAVE_FLASH_COOKIE_NAME);
	const justSavedStartQuote = savedSection === 'start-quote';
	const justSavedAbout = savedSection === 'about';
	const justSavedPhoto = savedSection === 'photo';

	if (savedSection) {
		cookies.delete(SAVE_FLASH_COOKIE_NAME, { path: '/admin' });
	}

	const [
		{ startQuoteDoc, startQuoteDocJson, heroSubtitle, aboutSection, photoUrl },
		projects,
		blogs
	] = await Promise.all([
		loadNormalizedHomeContent(),
		prisma.project.findMany({
			orderBy: { createdAt: 'desc' },
			select: { id: true, slug: true, title: true, visible: true, createdAt: true }
		}),
		prisma.blog.findMany({
			orderBy: { publishedAt: 'desc' },
			select: { id: true, slug: true, title: true, publishedAt: true }
		})
	]);

	return {
		startQuoteDoc,
		startQuoteDocJson,
		heroSubtitle,
		aboutSection,
		photoUrl,
		projects,
		blogs,
		justSavedStartQuote,
		justSavedAbout,
		justSavedPhoto,
		heroSubtitleMaxLength: HERO_SUBTITLE_MAX_LENGTH,
		aboutSectionMaxLength: ABOUT_SECTION_MAX_LENGTH
	};
};

const saveStartQuote: Actions['default'] = async ({ request, cookies }) => {
	const formData = Object.fromEntries(await request.formData());
	const parsedForm = UpdateStartQuoteSchema.safeParse(formData);

	if (!parsedForm.success) {
		return fail(400, { startQuoteError: 'Invalid start quote content.' });
	}

	let parsedDoc: unknown;

	try {
		parsedDoc = JSON.parse(parsedForm.data.startQuoteDoc);
	} catch {
		return fail(400, { startQuoteError: 'Start quote payload is not valid JSON.' });
	}

	const parsedStartQuoteDoc = StartQuoteDocSchema.safeParse(parsedDoc);

	if (!parsedStartQuoteDoc.success) {
		return fail(400, { startQuoteError: 'Start quote payload failed validation.' });
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
			heroSubtitle,
			aboutSection: DEFAULT_ABOUT_SECTION
		}
	});

	setSaveFlashCookie(cookies, 'start-quote');
	redirect(303, '/admin');
};

const saveAbout: Actions['default'] = async ({ request, cookies }) => {
	const formData = Object.fromEntries(await request.formData());
	const parsedForm = UpdateAboutSchema.safeParse(formData);

	if (!parsedForm.success) {
		return fail(400, { aboutError: 'Invalid about content.' });
	}

	const aboutSection = sanitizeAboutSection(parsedForm.data.aboutSection);

	await prisma.homeContent.upsert({
		where: { id: HOME_CONTENT_ID },
		update: {
			aboutSection
		},
		create: {
			id: HOME_CONTENT_ID,
			startQuoteDoc: startQuoteDocToJson(DEFAULT_START_QUOTE_DOC),
			heroSubtitle: DEFAULT_HERO_SUBTITLE,
			aboutSection
		}
	});

	setSaveFlashCookie(cookies, 'about');
	redirect(303, '/admin');
};

const deleteProject: Actions['default'] = async ({ request }) => {
	const formData = await request.formData();
	const slug = formData.get('slug');

	if (typeof slug !== 'string' || !slug.trim()) {
		return fail(400, { deleteError: 'Missing project slug.' });
	}

	await prisma.project.delete({ where: { slug } });
	redirect(303, '/admin');
};

const toggleVisibility: Actions['default'] = async ({ request }) => {
	const formData = await request.formData();
	const slug = formData.get('slug');

	if (typeof slug !== 'string' || !slug.trim()) {
		return fail(400, { toggleError: 'Missing project slug.' });
	}

	const project = await prisma.project.findUnique({
		where: { slug },
		select: { visible: true }
	});

	if (!project) {
		return fail(404, { toggleError: 'Project not found.' });
	}

	await prisma.project.update({
		where: { slug },
		data: { visible: !project.visible }
	});

	redirect(303, '/admin');
};

const deleteBlog: Actions['default'] = async ({ request }) => {
	const formData = await request.formData();
	const slug = formData.get('slug');

	if (typeof slug !== 'string' || !slug.trim()) {
		return fail(400, { deleteError: 'Missing blog post slug.' });
	}

	await prisma.blog.delete({ where: { slug } });
	redirect(303, '/admin');
};

export const actions: Actions = {
	saveStartQuote,
	saveAbout,
	deleteProject,
	toggleVisibility,
	deleteBlog,
	savePhoto: async ({ request, cookies }) => {
		const formData = Object.fromEntries(await request.formData());
		const photoUrl = formData.photoUrl;

		if (typeof photoUrl !== 'string' || !photoUrl.startsWith('/uploads/')) {
			return fail(400, { photoError: 'Invalid photo URL.' });
		}

		await prisma.homeContent.upsert({
			where: { id: HOME_CONTENT_ID },
			update: { photoUrl },
			create: {
				id: HOME_CONTENT_ID,
				startQuoteDoc: startQuoteDocToJson(DEFAULT_START_QUOTE_DOC),
				heroSubtitle: DEFAULT_HERO_SUBTITLE,
				aboutSection: DEFAULT_ABOUT_SECTION,
				photoUrl
			}
		});

		setSaveFlashCookie(cookies, 'photo');
		redirect(303, '/admin');
	}
};
