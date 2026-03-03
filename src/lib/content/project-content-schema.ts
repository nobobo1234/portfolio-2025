import { z } from 'zod';

// ---------------------------------------------------------------------------
// Marks
// ---------------------------------------------------------------------------

const ALLOWED_MARK_TYPES = ['bold', 'italic', 'code', 'strike', 'underline', 'link'] as const;

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

export type ProjectContentMark = z.infer<typeof MarkSchema>;

// ---------------------------------------------------------------------------
// Inline nodes
// ---------------------------------------------------------------------------

const TextNodeSchema = z.object({
	type: z.literal('text'),
	text: z.string().max(50000),
	marks: z.array(MarkSchema).optional()
});

const HardBreakNodeSchema = z.object({
	type: z.literal('hardBreak')
});

const InlineNodeSchema = z.discriminatedUnion('type', [TextNodeSchema, HardBreakNodeSchema]);

// ---------------------------------------------------------------------------
// Block nodes (recursive via z.lazy)
// ---------------------------------------------------------------------------

// Build the block-node schema lazily so list items can nest blocks.
type BlockNode =
	| { type: 'paragraph'; content?: InlineNode[] }
	| { type: 'heading'; attrs: { level: number }; content?: InlineNode[] }
	| { type: 'blockquote'; content?: BlockNode[] }
	| { type: 'bulletList'; content?: BlockNode[] }
	| { type: 'orderedList'; content?: BlockNode[] }
	| { type: 'listItem'; content?: BlockNode[] }
	| { type: 'codeBlock'; attrs?: { language?: string }; content?: InlineNode[] }
	| { type: 'horizontalRule' }
	| { type: 'hardBreak' };

type InlineNode = z.infer<typeof InlineNodeSchema>;

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

export const ProjectContentDocSchema = z.object({
	type: z.literal('doc'),
	content: z.array(BlockNodeSchema).min(1)
});

export type ProjectContentDoc = z.infer<typeof ProjectContentDocSchema>;

export function projectContentDocToJson(doc: ProjectContentDoc): string {
	return JSON.stringify(doc);
}

// Extract plain-text from a project content doc (useful for search / previews).
export function projectContentDocToText(doc: ProjectContentDoc): string {
	const parts: string[] = [];

	function visitInline(node: InlineNode) {
		if (node.type === 'text') parts.push(node.text);
	}

	function visitBlock(node: BlockNode) {
		if ('content' in node && Array.isArray(node.content)) {
			for (const child of node.content) {
				if (child.type === 'text' || child.type === 'hardBreak') {
					visitInline(child as InlineNode);
				} else {
					visitBlock(child as BlockNode);
				}
			}
		}
		if (node.type === 'paragraph' || node.type === 'heading') {
			parts.push('\n');
		}
	}

	for (const block of doc.content) visitBlock(block);
	return parts.join('').trim();
}

export { ALLOWED_MARK_TYPES };
