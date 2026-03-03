import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

/** Where uploaded images are stored. Override with the UPLOAD_DIR env var (used in Docker). */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads');

/** Hard server-side limit: 5 MB */
const MAX_BYTES = 5 * 1024 * 1024;

type ValidatedImageType = 'jpeg' | 'png' | 'webp';

/**
 * Reads the first 12 bytes of a buffer and matches them against known image
 * magic-byte signatures.  Returns the canonical type, or null if unknown.
 */
function detectImageType(buf: Uint8Array): ValidatedImageType | null {
	// JPEG: FF D8 FF
	if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';

	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (
		buf[0] === 0x89 &&
		buf[1] === 0x50 &&
		buf[2] === 0x4e &&
		buf[3] === 0x47 &&
		buf[4] === 0x0d &&
		buf[5] === 0x0a &&
		buf[6] === 0x1a &&
		buf[7] === 0x0a
	)
		return 'png';

	// WebP: RIFF ????  WEBP  (bytes 0–3 and 8–11)
	if (
		buf[0] === 0x52 && // R
		buf[1] === 0x49 && // I
		buf[2] === 0x46 && // F
		buf[3] === 0x46 && // F
		buf[8] === 0x57 && // W
		buf[9] === 0x45 && // E
		buf[10] === 0x42 && // B
		buf[11] === 0x50 // P
	)
		return 'webp';

	return null;
}

const EXTENSION: Record<ValidatedImageType, string> = {
	jpeg: '.jpg',
	png: '.png',
	webp: '.webp'
};

/**
 * Validates, re-encodes (via sharp, stripping all EXIF/metadata), and saves an
 * uploaded image file.
 *
 * Security guarantees:
 *  - Size is checked before reading into memory.
 *  - File type is verified by magic bytes, not the browser-supplied MIME type.
 *  - The image is fully re-encoded by sharp, destroying any hidden payloads.
 *  - The saved file has a random UUID name – the original filename is discarded.
 *
 * @returns The public path at which the file can later be fetched, e.g. `/uploads/abc.jpg`.
 * @throws {Error} with a human-readable message on any validation or I/O failure.
 */
export async function processAndSaveImage(file: File): Promise<string> {
	// 1. Size check (fast – no need to read the whole file first).
	if (file.size > MAX_BYTES) {
		throw new Error(
			`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`
		);
	}
	if (file.size === 0) {
		throw new Error('Uploaded file is empty.');
	}

	// 2. Read into memory and validate magic bytes.
	const arrayBuffer = await file.arrayBuffer();
	const input = new Uint8Array(arrayBuffer);

	const imageType = detectImageType(input);
	if (!imageType) {
		throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
	}

	// 3. Generate a safe, random filename – the original name is never used.
	const ext = EXTENSION[imageType];
	const filename = crypto.randomUUID() + ext;
	const destPath = path.join(UPLOAD_DIR, filename);

	// 4. Ensure the upload directory exists.
	await fs.mkdir(UPLOAD_DIR, { recursive: true });

	// 5. Re-encode through sharp.  This:
	//    - Strips all EXIF / metadata (withMetadata() is NOT called).
	//    - Redraws the image from raw pixel data, destroying any steganographic payload.
	//    - Produces a clean, canonical file.
	await sharp(Buffer.from(arrayBuffer)).toFormat(imageType, { quality: 85 }).toFile(destPath);

	// 6. Return the public path served by the /uploads/[filename] route.
	return `/uploads/${filename}`;
}
