import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import { z } from 'zod';
import { prisma } from '$lib/server/prisma';
import { BlogContentDocSchema } from '$lib/content/blog-content-schema';
import type { PageServerLoad } from './$types';

const UpdateBlogSchema = z.object({
	title: z.string().min(1).max(200),
	publishedAt: z.string().min(1),
	content: z.string().min(1).max(200000)
});

export const load: PageServerLoad = async ({ params }) => {
	const post = await prisma.blog.findUnique({
		where: { slug: params.slug }
	});

	if (!post) {
		error(404, 'Blog post not found');
	}

	return { post };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const rawFields = Object.fromEntries(await request.formData());

		const parsed = UpdateBlogSchema.safeParse(rawFields);

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

		const parsedContent = BlogContentDocSchema.safeParse(rawContent);
		if (!parsedContent.success) {
			const first = parsedContent.error.issues[0];
			return fail(400, {
				error: `Content: ${first.path.join('.')} — ${first.message}`,
				values: rawFields as Record<string, string>
			});
		}

		let publishedAt: Date;
		try {
			publishedAt = new Date(parsed.data.publishedAt);
			if (isNaN(publishedAt.getTime())) throw new Error('Invalid date');
		} catch {
			return fail(400, {
				error: 'Invalid publish date.',
				values: rawFields as Record<string, string>
			});
		}

		await prisma.blog.update({
			where: { slug: params.slug },
			data: {
				title: parsed.data.title,
				publishedAt,
				content: parsed.data.content
			}
		});

		redirect(303, '/admin');
	}
};
