import { PrismaClient } from '../prisma/generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL is required for db:smoke');
}

const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }) });

async function main() {
	await prisma.$executeRawUnsafe(
		'CREATE TABLE IF NOT EXISTS ci_smoke (id INTEGER PRIMARY KEY AUTOINCREMENT, value TEXT NOT NULL)'
	);
	await prisma.$executeRawUnsafe("INSERT INTO ci_smoke (value) VALUES ('ok')");

	const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
		'SELECT COUNT(*) as count FROM ci_smoke'
	);

	const count = Number(rows[0]?.count ?? 0);
	if (!Number.isFinite(count) || count < 1) {
		throw new Error('Database smoke test failed: expected at least one row in ci_smoke');
	}

	console.log(`Database smoke test passed (rows: ${count})`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
