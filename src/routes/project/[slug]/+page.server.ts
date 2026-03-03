import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const projects = {
	ssra: {
		name: 'SSRA',
		img: '/ssra2.png',
		subtitle: 'A website for a student association',
		demoUrl: 'https://ssra.nl'
	},
	'good-vibes': {
		name: 'Good Vibes Runclub',
		img: '/danique.png',
		subtitle: 'Runclub of Danique Hosmar',
		demoUrl: 'https://goodvibesrunclub.nl'
	},
	led: {
		name: 'Landelijke Econometristendag',
		img: '/led.png',
		subtitle: 'National Econometriciansday',
		demoUrl: 'https://leditbeyourday.nl'
	}
} as const;

export type ProjectKey = keyof typeof projects;

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug as ProjectKey;

	if (Object.hasOwn(projects, slug)) {
		return { project: projects[slug] };
	} else {
		return error(404, 'Cannot find project');
	}
};
