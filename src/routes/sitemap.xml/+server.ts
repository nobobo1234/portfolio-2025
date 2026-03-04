import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url }) => {
	const origin = url.origin;

	const [projects, blogs] = await Promise.all([
		prisma.project.findMany({
			where: { visible: true },
			select: { slug: true, updatedAt: true }
		}),
		prisma.blog.findMany({
			where: { publishedAt: { lte: new Date() } },
			select: { slug: true, publishedAt: true, updatedAt: true }
		})
	]);

	const today = new Date().toISOString().split('T')[0];

	const staticPages = [
		{ url: `${origin}/`, changefreq: 'weekly', priority: '1.0', lastmod: today },
		{ url: `${origin}/#about`, changefreq: 'monthly', priority: '0.7', lastmod: today },
		{ url: `${origin}/#projects`, changefreq: 'weekly', priority: '0.8', lastmod: today },
		{ url: `${origin}/#writings`, changefreq: 'weekly', priority: '0.8', lastmod: today }
	];

	const projectPages = projects.map((p) => ({
		url: `${origin}/project/${p.slug}`,
		changefreq: 'monthly',
		priority: '0.8',
		lastmod: p.updatedAt.toISOString().split('T')[0]
	}));

	const blogPages = blogs.map((b) => ({
		url: `${origin}/blog/${b.slug}`,
		changefreq: 'yearly',
		priority: '0.7',
		lastmod: b.updatedAt.toISOString().split('T')[0]
	}));

	const pages = [...staticPages, ...projectPages, ...blogPages];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
