import fs from 'node:fs/promises';
import { json } from '@sveltejs/kit';
import { processAndSaveImage, UPLOAD_DIR } from '$lib/server/upload';
import type { RequestHandler } from './$types';

/**
 * GET /admin/upload
 *
 * Returns a list of all previously uploaded image URLs.
 * Response (200): { images: string[] }
 */
export const GET: RequestHandler = async () => {
	try {
		await fs.mkdir(UPLOAD_DIR, { recursive: true });
		const entries = await fs.readdir(UPLOAD_DIR);
		const images = entries
			.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
			.sort()
			.reverse()
			.map((f) => `/uploads/${f}`);
		return json({ images });
	} catch {
		return json({ error: 'Failed to read uploads directory.' }, { status: 500 });
	}
};

/**
 * POST /admin/upload
 *
 * Accepts a multipart/form-data request with a single `file` field.
 * Validates, re-encodes, and persists the image via processAndSaveImage.
 *
 * Protected automatically: hooks.server.ts redirects any unauthenticated
 * request to /admin/* to /login before this handler runs.
 *
 * Response (200): { url: string }   – public path, e.g. /uploads/abc.jpg
 * Response (400): { error: string } – validation or I/O failure
 */
export const POST: RequestHandler = async ({ request }) => {
	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return json({ error: 'Invalid multipart request.' }, { status: 400 });
	}

	const file = formData.get('file');

	if (!(file instanceof File)) {
		return json({ error: 'A "file" field is required.' }, { status: 400 });
	}

	let url: string;
	try {
		url = await processAndSaveImage(file);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Upload failed.';
		return json({ error: message }, { status: 400 });
	}

	return json({ url });
};
