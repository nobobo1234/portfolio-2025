import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import argon2 from 'argon2';

const ADMIN_USERNAME = 'admin';
// Read the admin password from the environment; never hardcode secrets.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

// Fail fast to avoid seeding with an empty or missing password.
if (!ADMIN_PASSWORD) {
	throw new Error('ADMIN_PASSWORD is required to seed the admin user');
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
	// Hash the password with explicit parameters for predictable hardness.
	const passwordHash = await argon2.hash(ADMIN_PASSWORD, {
		type: argon2.argon2id,
		memoryCost: 19456,
		timeCost: 2,
		parallelism: 1
	});

	await prisma.user.upsert({
		where: { username: ADMIN_USERNAME },
		update: { passwordHash },
		create: {
			username: ADMIN_USERNAME,
			passwordHash
		}
	});

	console.warn(
		'Security reminder: remove ADMIN_PASSWORD from your .env now that the admin user is seeded.'
	);
}

main()
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
