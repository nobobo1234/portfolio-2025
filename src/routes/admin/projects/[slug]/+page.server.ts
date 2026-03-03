import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import { ProjectContentDocSchema } from '$lib/content/project-content-schema';
import { processAndSaveImage } from '$lib/server/upload';
import type { PageServerLoad } from './$types';

const UpdateProjectSchema = z.object({
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

export const load: PageServerLoad = async ({ params }) => {
	const project = await prisma.project.findUnique({
		where: { slug: params.slug }
	});

	if (!project) {
		error(404, 'Project not found');
	}

	return { project };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();

		// --- Optional image upload ---
		const bannerImgFile = formData.get('bannerImg');
		let bannerImgUrl: string | null = null;

		if (bannerImgFile instanceof File && bannerImgFile.size > 0) {
			try {
				bannerImgUrl = await processAndSaveImage(bannerImgFile);
			} catch (e) {
				const msg = e instanceof Error ? e.message : 'Image upload failed.';
				return fail(400, { error: msg });
			}
		}

		// --- Text field validation ---
		const rawFields = Object.fromEntries(
			[...formData.entries()].filter(([k]) => k !== 'bannerImg')
		);

		if (rawFields.githubUrl === '') {
			delete rawFields.githubUrl;
		}

		const parsed = UpdateProjectSchema.safeParse(rawFields);

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
			return fail(400, {
				error: 'Content is not valid JSON.',
				values: rawFields as Record<string, string>
			});
		}

		const parsedContent = ProjectContentDocSchema.safeParse(rawContent);
		if (!parsedContent.success) {
			const first = parsedContent.error.issues[0];
			return fail(400, {
				error: `Content: ${first.path.join('.')} — ${first.message}`,
				values: rawFields as Record<string, string>
			});
		}

		// Fetch current bannerImgUrl if no new image was uploaded
		if (!bannerImgUrl) {
			const current = await prisma.project.findUnique({
				where: { slug: params.slug },
				select: { bannerImgUrl: true }
			});
			if (!current) error(404, 'Project not found');
			bannerImgUrl = current.bannerImgUrl;
		}

		await prisma.project.update({
			where: { slug: params.slug },
			data: {
				title: parsed.data.title,
				subtitle: parsed.data.subtitle,
				content: parsed.data.content,
				client: parsed.data.client,
				year: parsed.data.year,
				services: parsed.data.services,
				demoUrl: parsed.data.demoUrl,
				githubUrl: parsed.data.githubUrl ?? null,
				bannerImgUrl,
				technology: parsed.data.technology
			}
		});

		redirect(303, '/admin');
	}
};
