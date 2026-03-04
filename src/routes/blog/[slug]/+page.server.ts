import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { blogContentDocJsonToHtml } from '$lib/content/blog-content-render';

function extractDescription(html: string, maxLength = 155): string {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);
}

export const load: PageServerLoad = async ({ params }) => {
	const post = await prisma.blog.findUnique({
		where: { slug: params.slug }
	});

	if (!post) {
		error(404, 'Blog post not found');
	}

	const contentHtml = blogContentDocJsonToHtml(post.content);

	return {
		post: {
			title: post.title,
			publishedAt: post.publishedAt,
			publishedAtIso: post.publishedAt.toISOString(),
			description: extractDescription(contentHtml),
			contentHtml
		}
	};
};
