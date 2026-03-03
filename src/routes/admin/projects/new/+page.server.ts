import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import { ProjectContentDocSchema } from '$lib/content/project-content-schema';
import { processAndSaveImage } from '$lib/server/upload';

const CreateProjectSchema = z.object({
	title: z.string().min(1).max(200),
	subtitle: z.string().min(1).max(400),
	content: z.string().min(1).max(200000),
	client: z.string().min(1).max(200),
	year: z.string().min(1).max(20),
	services: z.string().min(1).max(400),
	demoUrl: z.string().min(1).max(500),
	githubUrl: z.string().max(500).optional(),
	technology: z.string().min(1).max(400)
});

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();

		// --- Image upload (validated before anything else) ---
		const bannerImgFile = formData.get('bannerImg');

		if (!(bannerImgFile instanceof File) || bannerImgFile.size === 0) {
			return fail(400, { error: 'A banner image is required.' });
		}

		let bannerImgUrl: string;
		try {
			bannerImgUrl = await processAndSaveImage(bannerImgFile);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Image upload failed.';
			return fail(400, { error: msg });
		}

		// --- Text field validation ---
		const rawFields = Object.fromEntries(
			[...formData.entries()].filter(([k]) => k !== 'bannerImg')
		);

		if (rawFields.githubUrl === '') {
			delete rawFields.githubUrl;
		}

		const parsed = CreateProjectSchema.safeParse(rawFields);

		if (!parsed.success) {
			const first = parsed.error.issues[0];
			return fail(400, {
				error: `${first.path.join('.')}: ${first.message}`,
				values: rawFields as Record<string, string>
			});
		}

		let rawContent: unknown;
		try {
			rawContent = JSON.parse(parsed.data.content);
		} catch {
			return fail(400, { error: 'Content is not valid JSON.', values: rawFields as Record<string, string> });
		}

		const parsedContent = ProjectContentDocSchema.safeParse(rawContent);
		if (!parsedContent.success) {
			const first = parsedContent.error.issues[0];
			return fail(400, {
				error: `Content: ${first.path.join('.')} — ${first.message}`,
				values: rawFields as Record<string, string>
			});
		}

		await prisma.project.create({
			data: {
				slug: '',
				title: parsed.data.title,
				subtitle: parsed.data.subtitle,
				content: parsed.data.content,
				client: parsed.data.client,
				year: parsed.data.year,
				services: parsed.data.services,
				demoUrl: parsed.data.demoUrl,
				githubUrl: parsed.data.githubUrl ?? null,
				bannerImgUrl: bannerImgUrl,
				technology: parsed.data.technology
			}
		});

		redirect(303, `/admin`);
	}
};
