import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { blogContentDocJsonToHtml } from '$lib/content/blog-content-render';

export const load: PageServerLoad = async ({ params }) => {
	const post = await prisma.blog.findUnique({
		where: { slug: params.slug }
	});

	if (!post) {
		error(404, 'Blog post not found');
	}

	return {
		post: {
			title: post.title,
			publishedAt: post.publishedAt,
			contentHtml: blogContentDocJsonToHtml(post.content)
		}
	};
};
