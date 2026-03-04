import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import argon2 from 'argon2';
import {
	DEFAULT_ABOUT_SECTION,
	DEFAULT_HERO_SUBTITLE,
	DEFAULT_START_QUOTE_DOC,
	HOME_CONTENT_ID
} from '../src/lib/content/home-content-schema';
import { startQuoteDocToJson } from '../src/lib/content/home-content-normalize';

const ADMIN_USERNAME = 'admin';
// Read the admin password from the environment; never hardcode secrets.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
	const existingUser = await prisma.user.findUnique({ where: { username: ADMIN_USERNAME } });

	if (!existingUser) {
		// First run: ADMIN_PASSWORD is required to create the admin user.
		if (!ADMIN_PASSWORD) {
			throw new Error('ADMIN_PASSWORD is required to seed the admin user on first run');
		}
		const passwordHash = await argon2.hash(ADMIN_PASSWORD, {
			type: argon2.argon2id,
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1
		});
		await prisma.user.create({ data: { username: ADMIN_USERNAME, passwordHash } });
		console.log('Admin user created. You can now remove ADMIN_PASSWORD from your .env.');
	} else if (ADMIN_PASSWORD) {
		// ADMIN_PASSWORD still present: update the hash so password changes are applied on redeploy.
		const passwordHash = await argon2.hash(ADMIN_PASSWORD, {
			type: argon2.argon2id,
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1
		});
		await prisma.user.update({ where: { username: ADMIN_USERNAME }, data: { passwordHash } });
		console.log('Admin password updated.');
	} else {
		console.log('Admin user already exists, skipping password seed.');
	}

	await prisma.homeContent.upsert({
		where: { id: HOME_CONTENT_ID },
		update: {},
		create: {
			id: HOME_CONTENT_ID,
			startQuoteDoc: startQuoteDocToJson(DEFAULT_START_QUOTE_DOC),
			heroSubtitle: DEFAULT_HERO_SUBTITLE,
			aboutSection: DEFAULT_ABOUT_SECTION
		}
	});
}

main()
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
