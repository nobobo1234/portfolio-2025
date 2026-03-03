import 'dotenv/config';
import { PrismaClient } from '../../../prisma/generated/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });

type SlugModel = 'project' | 'blog';

function slugify(value: string): string {
	return (
		value
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/['’]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.replace(/-{2,}/g, '-') || 'entry'
	);
}

const basePrisma = new PrismaClient({ adapter });

async function findBySlug(model: SlugModel, slug: string) {
	if (model === 'project') {
		return basePrisma.project.findUnique({ where: { slug }, select: { id: true } });
	}

	return basePrisma.blog.findUnique({ where: { slug }, select: { id: true } });
}

async function buildUniqueSlug(model: SlugModel, title: string) {
	const baseSlug = slugify(title);
	if (!(await findBySlug(model, baseSlug))) {
		return baseSlug;
	}

	const maxSuffixAttempts = 50;
	for (let suffix = 2; suffix <= maxSuffixAttempts + 1; suffix += 1) {
		const candidate = `${baseSlug}-${suffix}`;
		if (!(await findBySlug(model, candidate))) {
			return candidate;
		}
	}

	// This is unlikely to ever happen but JUST in case.
	return `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

async function applySlugForCreateData(model: SlugModel, data: unknown) {
	if (!data || typeof data !== 'object') {
		return;
	}

	const payload = data as Record<string, unknown>;
	if (typeof payload.slug === 'string' && payload.slug.trim().length > 0) {
		return;
	}

	if (typeof payload.title !== 'string' || payload.title.trim().length === 0) {
		return;
	}

	payload.slug = await buildUniqueSlug(model, payload.title);
}

export const prisma = basePrisma.$extends({
	query: {
		project: {
			async create({ args, query }) {
				await applySlugForCreateData('project', args.data);
				return query(args);
			},
			async upsert({ args, query }) {
				await applySlugForCreateData('project', args.create);
				return query(args);
			}
		},
		blog: {
			async create({ args, query }) {
				await applySlugForCreateData('blog', args.data);
				return query(args);
			},
			async upsert({ args, query }) {
				await applySlugForCreateData('blog', args.create);
				return query(args);
			}
		}
	}
});
