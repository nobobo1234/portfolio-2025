import { z } from 'zod';

// ---------------------------------------------------------------------------
// Marks (identical to project content)
// ---------------------------------------------------------------------------

const LinkAttrsSchema = z.object({
	href: z.string().max(2000),
	target: z.string().optional(),
	rel: z.string().optional(),
	class: z.string().optional()
});

const MarkSchema = z.discriminatedUnion('type', [
	z.object({ type: z.literal('bold') }),
	z.object({ type: z.literal('italic') }),
	z.object({ type: z.literal('code') }),
	z.object({ type: z.literal('strike') }),
	z.object({ type: z.literal('underline') }),
	z.object({ type: z.literal('link'), attrs: LinkAttrsSchema })
]);

export type BlogContentMark = z.infer<typeof MarkSchema>;

// ---------------------------------------------------------------------------
// Inline nodes (text + hardBreak + image — TipTap Image is inline by default)
// ---------------------------------------------------------------------------

const TextNodeSchema = z.object({
	type: z.literal('text'),
	text: z.string().max(50000),
	marks: z.array(MarkSchema).optional()
});

const HardBreakNodeSchema = z.object({
	type: z.literal('hardBreak')
});

const ImageNodeSchema = z.object({
	type: z.literal('image'),
	attrs: z.object({
		src: z.string().max(2000),
		alt: z.string().max(500).optional().nullable(),
		title: z.string().max(500).optional().nullable()
	})
});

const InlineNodeSchema = z.discriminatedUnion('type', [
	TextNodeSchema,
	HardBreakNodeSchema,
	ImageNodeSchema
]);

// ---------------------------------------------------------------------------
// Block nodes (recursive via z.lazy)
// ---------------------------------------------------------------------------

type InlineNode = z.infer<typeof InlineNodeSchema>;

type BlockNode =
	| { type: 'paragraph'; content?: InlineNode[] }
	| { type: 'heading'; attrs: { level: number }; content?: InlineNode[] }
	| { type: 'blockquote'; content?: BlockNode[] }
	| { type: 'bulletList'; content?: BlockNode[] }
	| { type: 'orderedList'; attrs?: { start?: number }; content?: BlockNode[] }
	| { type: 'listItem'; content?: BlockNode[] }
	| { type: 'codeBlock'; attrs?: { language?: string }; content?: InlineNode[] }
	| { type: 'horizontalRule' }
	| { type: 'hardBreak' };

const BlockNodeSchema: z.ZodType<BlockNode> = z.lazy(() =>
	z.discriminatedUnion('type', [
		z.object({
			type: z.literal('paragraph'),
			content: z.array(InlineNodeSchema).optional()
		}),
		z.object({
			type: z.literal('heading'),
			attrs: z.object({ level: z.number().int().min(1).max(6) }),
			content: z.array(InlineNodeSchema).optional()
		}),
		z.object({
			type: z.literal('blockquote'),
			content: z.array(BlockNodeSchema).optional()
		}),
		z.object({
			type: z.literal('bulletList'),
			content: z.array(BlockNodeSchema).optional()
		}),
		z.object({
			type: z.literal('orderedList'),
			attrs: z.object({ start: z.number().int().optional() }).optional(),
			content: z.array(BlockNodeSchema).optional()
		}),
		z.object({
			type: z.literal('listItem'),
			content: z.array(BlockNodeSchema).optional()
		}),
		z.object({
			type: z.literal('codeBlock'),
			attrs: z.object({ language: z.string().optional() }).optional(),
			content: z.array(InlineNodeSchema).optional()
		}),
		z.object({ type: z.literal('horizontalRule') }),
		z.object({ type: z.literal('hardBreak') })
	])
);

// ---------------------------------------------------------------------------
// Root doc
// ---------------------------------------------------------------------------

export const BlogContentDocSchema = z.object({
	type: z.literal('doc'),
	content: z.array(BlockNodeSchema).min(1)
});

export type BlogContentDoc = z.infer<typeof BlogContentDocSchema>;

export function blogContentDocToJson(doc: BlogContentDoc): string {
	return JSON.stringify(doc);
}
