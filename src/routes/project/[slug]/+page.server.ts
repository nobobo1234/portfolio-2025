import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params }) => {
	const project = await prisma.project.findUnique({
		where: { slug: params.slug }
	});

	if (!project) {
		error(404, 'Cannot find project');
	}

	return {
		project: {
			name: project.title,
			img: project.bannerImgUrl,
			subtitle: project.subtitle,
			demoUrl: project.demoUrl,
			client: project.client,
			year: project.year,
			services: project.services,
			technology: project.technology,
			githubUrl: project.githubUrl
		}
	};
};
