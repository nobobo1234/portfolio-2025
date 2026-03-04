import fs from 'node:fs/promises';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { UPLOAD_DIR } from '$lib/server/upload';
import type { RequestHandler } from './$types';

/**
 * Safe filename pattern: UUIDs + allowed image extensions only.
 * Rejects anything with path separators, dots in the stem, or unknown extensions.
 */
const SAFE_FILENAME_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i;

const CONTENT_TYPES: Record<string, string> = {
	jpg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp'
};

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;

	// Strict allow-list check – rejects path traversal and unexpected patterns.
	if (!SAFE_FILENAME_RE.test(filename)) {
		error(404, 'Not found');
	}

	const ext = filename.split('.').at(-1)!.toLowerCase();
	const contentType = CONTENT_TYPES[ext];
	if (!contentType) {
		error(404, 'Not found');
	}

	const filePath = path.join(UPLOAD_DIR, filename);

	let fileBuffer: Buffer;
	try {
		fileBuffer = await fs.readFile(filePath);
	} catch (e) {
		error(404, 'Not found');
	}

	return new Response(new Uint8Array(fileBuffer), {
		headers: {
			'Content-Type': contentType,
			'X-Content-Type-Options': 'nosniff',
			'Cache-Control': 'public, max-age=31536000, immutable'
		}
	});
};
