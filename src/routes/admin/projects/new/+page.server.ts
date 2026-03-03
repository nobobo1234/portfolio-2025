import { fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import { ProjectContentDocSchema } from '$lib/content/project-content-schema';

const CreateProjectSchema = z.object({
	title: z.string().min(1).max(200),
	subtitle: z.string().min(1).max(400),
	content: z.string().min(1).max(200000),
	client: z.string().min(1).max(200),
	year: z.string().min(1).max(20),
	services: z.string().min(1).max(400),
	demoUrl: z.string().min(1).max(500),
	githubUrl: z.string().max(500).optional(),
	bannerImgUrl: z.string().min(1).max(500),
	technology: z.string().min(1).max(400)
});

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		// Treat empty githubUrl as absent
		if (formData.githubUrl === '') {
			delete formData.githubUrl;
		}

		const parsed = CreateProjectSchema.safeParse(formData);

		if (!parsed.success) {
			const first = parsed.error.issues[0];
			return fail(400, {
				error: `${first.path.join('.')}: ${first.message}`,
				values: formData
			});
		}

		let rawContent: unknown;
		try {
			rawContent = JSON.parse(parsed.data.content);
		} catch {
			return fail(400, { error: 'Content is not valid JSON.', values: formData });
		}

		const parsedContent = ProjectContentDocSchema.safeParse(rawContent);
		if (!parsedContent.success) {
			const first = parsedContent.error.issues[0];
			return fail(400, {
				error: `Content: ${first.path.join('.')} — ${first.message}`,
				values: formData
			});
		}

		await prisma.project.create({
			data: {
				slug: '', // filled in by the Prisma slug extension
				title: parsed.data.title,
				subtitle: parsed.data.subtitle,
				content: parsed.data.content,
				client: parsed.data.client,
				year: parsed.data.year,
				services: parsed.data.services,
				demoUrl: parsed.data.demoUrl,
				githubUrl: parsed.data.githubUrl ?? null,
				bannerImgUrl: parsed.data.bannerImgUrl,
				technology: parsed.data.technology
			}
		});

		redirect(303, `/admin`);
	}
};
