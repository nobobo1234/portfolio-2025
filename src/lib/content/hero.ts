import { z } from 'zod';

const ITALIC_MARK_TYPE = 'italic';

// Using Zod to setup the schema's for server-side validation of the
// start quote schema. So that it must consist of a list of italics or normal text.
export const StartQuoteMarkSchema = z.object({
	type: z.literal(ITALIC_MARK_TYPE)
});

// Each node consist of a type and text, with some activated marks (with contain
// italic markings).
export const StartQuoteTextNodeSchema = z.object({
	type: z.literal('text'),
	text: z.string().min(1),
	marks: z.array(StartQuoteMarkSchema).optional() // doesnt need to be italic.
});

// Equivalent of a <br>
export const StartQuoteHardBreakNodeSchema = z.object({
	type: z.literal('hardBreak')
});

// An inline node should be a hardbreak or a text.
export const StartQuoteInlineNodeSchema = z.discriminatedUnion('type', [
	StartQuoteTextNodeSchema,
	StartQuoteHardBreakNodeSchema
]);

// Each node should be contained in a paragraph.
export const StartQuoteParagraphNodeSchema = z.object({
	type: z.literal('paragraph'),
	content: z.array(StartQuoteInlineNodeSchema).min(1)
});

// The doc is the top-level structure the quote is contained in.
export const StartQuoteDocSchema = z.object({
	type: z.literal('doc'),
	content: z.array(StartQuoteParagraphNodeSchema).min(1)
});

// Convert every Zod schema to types
export type StartQuoteMark = z.infer<typeof StartQuoteMarkSchema>;
export type StartQuoteTextNode = z.infer<typeof StartQuoteTextNodeSchema>;
export type StartQuoteHardBreakNode = z.infer<typeof StartQuoteHardBreakNodeSchema>;
export type StartQuoteInlineNode = z.infer<typeof StartQuoteInlineNodeSchema>;
export type StartQuoteParagraphNode = z.infer<typeof StartQuoteParagraphNodeSchema>;
export type StartQuoteDoc = z.infer<typeof StartQuoteDocSchema>;

// JSON version of the render token, so this is used for RENDERING not for storing,
// so just before rendering the Zod nodes are converted into this.
export type StartQuoteRenderToken =
	| {
			type: 'text';
			text: string;
			italic: boolean;
	  }
	| {
			type: 'break';
	  };

export const HOME_CONTENT_ID = 'home';
export const HERO_SUBTITLE_MAX_LENGTH = 140;
export const DEFAULT_HERO_SUBTITLE = 'For anyone trying to feel like themselves online.';
export const DEFAULT_START_QUOTE_DOC: StartQuoteDoc = {
	type: 'doc',
	content: [
		{
			type: 'paragraph',
			content: [
				{ type: 'text', text: 'I make websites like I make ' },
				{ type: 'text', text: 'music', marks: [{ type: 'italic' }] },
				{ type: 'text', text: ',' },
				{ type: 'hardBreak' },
				{ type: 'text', text: 'singing', marks: [{ type: 'italic' }] },
				{ type: 'text', text: ' and just a little bit unpredictable.' }
			]
		}
	]
};

// Convert the quoteDoc json to a string just before saving to db.
export function startQuoteDocToJson(doc: StartQuoteDoc): string {
	return JSON.stringify(doc);
}

// Sanitze the hero subtitle by removing \r or \n and extra whitespace and trim.
// Also clamp it to a max length.
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

// Function to convert the doc to render tokens to use just before showing it
// on the homepage.
export function docToRenderTokens(doc: StartQuoteDoc): StartQuoteRenderToken[] {
	const tokens: StartQuoteRenderToken[] = [];

	doc.content.forEach((paragraph, paragraphIndex) => {
		paragraph.content.forEach((node) => {
			if (node.type === 'hardBreak') {
				tokens.push({ type: 'break' });
				return;
			}

			tokens.push({
				type: 'text',
				text: node.text,
				italic: !!node.marks?.some((mark) => mark.type === ITALIC_MARK_TYPE)
			});
		});

		if (paragraphIndex < doc.content.length - 1) {
			tokens.push({ type: 'break' });
		}
	});

	return tokens;
}

export function parseStartQuoteDoc(docJson: string): StartQuoteDoc {
	try {
		const parsed = StartQuoteDocSchema.safeParse(JSON.parse(docJson));
		return parsed.success ? parsed.data : DEFAULT_START_QUOTE_DOC;
	} catch {
		return DEFAULT_START_QUOTE_DOC;
	}
}
