import {
	ABOUT_SECTION_MAX_LENGTH,
	DEFAULT_ABOUT_SECTION,
	DEFAULT_HERO_SUBTITLE,
	DEFAULT_START_QUOTE_DOC,
	HERO_SUBTITLE_MAX_LENGTH,
	StartQuoteDocSchema
} from '$lib/content/home-content-schema';
import type { StartQuoteDoc } from '$lib/content/home-content-schema';

export function startQuoteDocToJson(doc: StartQuoteDoc): string {
	return JSON.stringify(doc);
}

export function sanitizeHeroSubtitle(input: unknown): string {
	if (typeof input !== 'string') {
		return DEFAULT_HERO_SUBTITLE;
	}

	const normalized = input
		.replace(/[\r\n]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	const clamped = normalized.slice(0, HERO_SUBTITLE_MAX_LENGTH);

	if (clamped.length === 0) {
		return DEFAULT_HERO_SUBTITLE;
	}

	return clamped;
}

export function sanitizeAboutSection(input: unknown): string {
	if (typeof input !== 'string') {
		return DEFAULT_ABOUT_SECTION;
	}

	const normalized = input
		.replace(/\r\n?/g, '\n')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	const clamped = normalized.slice(0, ABOUT_SECTION_MAX_LENGTH);

	if (clamped.length === 0) {
		return DEFAULT_ABOUT_SECTION;
	}

	return clamped;
}

export function parseStartQuoteDoc(docJson: string): StartQuoteDoc {
	try {
		const parsed = StartQuoteDocSchema.safeParse(JSON.parse(docJson));
		return parsed.success ? parsed.data : DEFAULT_START_QUOTE_DOC;
	} catch {
		return DEFAULT_START_QUOTE_DOC;
	}
}
