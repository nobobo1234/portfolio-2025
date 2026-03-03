import { json } from '@sveltejs/kit';
import { processAndSaveImage } from '$lib/server/upload';
import type { RequestHandler } from './$types';

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
