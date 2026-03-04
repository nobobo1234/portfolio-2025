import { z } from 'zod';

const ITALIC_MARK_TYPE = 'italic';

export const StartQuoteMarkSchema = z.object({
	type: z.literal(ITALIC_MARK_TYPE)
});

export const StartQuoteTextNodeSchema = z.object({
	type: z.literal('text'),
	text: z.string().min(1),
	marks: z.array(StartQuoteMarkSchema).optional()
});

export const StartQuoteHardBreakNodeSchema = z.object({
	type: z.literal('hardBreak')
});

export const StartQuoteInlineNodeSchema = z.discriminatedUnion('type', [
	StartQuoteTextNodeSchema,
	StartQuoteHardBreakNodeSchema
]);

export const StartQuoteParagraphNodeSchema = z.object({
	type: z.literal('paragraph'),
	content: z.array(StartQuoteInlineNodeSchema).min(1)
});

export const StartQuoteDocSchema = z.object({
	type: z.literal('doc'),
	content: z.array(StartQuoteParagraphNodeSchema).min(1)
});

export type StartQuoteMark = z.infer<typeof StartQuoteMarkSchema>;
export type StartQuoteTextNode = z.infer<typeof StartQuoteTextNodeSchema>;
export type StartQuoteHardBreakNode = z.infer<typeof StartQuoteHardBreakNodeSchema>;
export type StartQuoteInlineNode = z.infer<typeof StartQuoteInlineNodeSchema>;
export type StartQuoteParagraphNode = z.infer<typeof StartQuoteParagraphNodeSchema>;
export type StartQuoteDoc = z.infer<typeof StartQuoteDocSchema>;

export const HOME_CONTENT_ID = 'home';
export const HERO_SUBTITLE_MAX_LENGTH = 140;
export const ABOUT_SECTION_MAX_LENGTH = 2400;
export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const DEFAULT_HERO_SUBTITLE = 'For anyone trying to feel like themselves online.';
export const DEFAULT_CONTACT_EMAIL = 'noahvanboven@gmail.com';
export const DEFAULT_ABOUT_SECTION =
	'I make and design websites for people like you. Not just single pages, but spaces that reflect your personality. Good websites should feel like a second language you already spoke, not something that screams. I’ve been coding websites since I was 11. Mostly out of curiosity, but honestly, because I’ve always been a little obsessed. That part hasn’t really changed.';
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
