import type { BlogContentDoc, BlogContentMark } from '$lib/content/blog-content-schema';
import { BlogContentDocSchema } from '$lib/content/blog-content-schema';

// ---------------------------------------------------------------------------
// HTML escaping
// ---------------------------------------------------------------------------

function esc(val: string): string {
	return val
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

// ---------------------------------------------------------------------------
// Inline marks → wrapping HTML
// ---------------------------------------------------------------------------

function applyMarks(text: string, marks: BlogContentMark[] | undefined): string {
	if (!marks || marks.length === 0) return text;

	let result = text;
	for (const mark of marks) {
		switch (mark.type) {
			case 'bold':
				result = `<strong>${result}</strong>`;
				break;
			case 'italic':
				result = `<em>${result}</em>`;
				break;
			case 'underline':
				result = `<u>${result}</u>`;
				break;
			case 'strike':
				result = `<s>${result}</s>`;
				break;
			case 'code':
				result = `<code>${result}</code>`;
				break;
			case 'link': {
				const href = esc(mark.attrs.href);
				const rel = mark.attrs.rel ? esc(mark.attrs.rel) : 'noopener noreferrer';
				const target = mark.attrs.target ? esc(mark.attrs.target) : '_blank';
				result = `<a href="${href}" target="${target}" rel="${rel}">${result}</a>`;
				break;
			}
		}
	}
	return result;
}

// ---------------------------------------------------------------------------
// Node type aliases
// ---------------------------------------------------------------------------

type AnyNode = {
	type: string;
	text?: string;
	attrs?: Record<string, unknown>;
	marks?: BlogContentMark[];
	content?: AnyNode[];
};

// ---------------------------------------------------------------------------
// Block → HTML
// ---------------------------------------------------------------------------

function renderBlock(node: AnyNode): string {
	switch (node.type) {
		case 'paragraph': {
			if (!node.content || node.content.length === 0) return '<p></p>';
			const inner = renderInlineContent(node.content);
			return `<p>${inner}</p>`;
		}
		case 'heading': {
			const level = (node.attrs?.level as number) ?? 2;
			const tag = `h${Math.min(Math.max(level, 1), 6)}`;
			const inner = node.content ? renderInlineContent(node.content) : '';
			return `<${tag}>${inner}</${tag}>`;
		}
		case 'blockquote': {
			const inner = node.content ? node.content.map(renderBlock).join('') : '';
			return `<blockquote>${inner}</blockquote>`;
		}
		case 'bulletList': {
			const inner = node.content ? node.content.map(renderBlock).join('') : '';
			return `<ul>${inner}</ul>`;
		}
		case 'orderedList': {
			const start = node.attrs?.start as number | undefined;
			const startAttr = start && start !== 1 ? ` start="${start}"` : '';
			const inner = node.content ? node.content.map(renderBlock).join('') : '';
			return `<ol${startAttr}>${inner}</ol>`;
		}
		case 'listItem': {
			// TipTap wraps each list item's text in a paragraph node.
			// When the item only contains a single paragraph, render its
			// inline content directly so we get <li>text</li> instead of
			// <li><p>text</p></li>, which avoids unwanted margin/spacing.
			if (
				node.content &&
				node.content.length === 1 &&
				node.content[0].type === 'paragraph'
			) {
				const para = node.content[0];
				const inner = para.content ? renderInlineContent(para.content) : '';
				return `<li>${inner}</li>`;
			}
			const inner = node.content ? node.content.map(renderBlock).join('') : '';
			return `<li>${inner}</li>`;
		}
		case 'codeBlock': {
			const lang = node.attrs?.language as string | undefined;
			const inner = node.content ? renderInlineContent(node.content) : '';
			const dataLang = lang ? ` data-language="${esc(lang)}"` : '';
			return `<pre${dataLang}><code>${inner}</code></pre>`;
		}
		case 'horizontalRule':
			return '<hr />';
		case 'hardBreak':
			return '<br />';
		default:
			return '';
	}
}

function renderInlineContent(nodes: AnyNode[]): string {
	return nodes
		.map((node) => {
			if (node.type === 'text') {
				return applyMarks(esc(node.text ?? ''), node.marks);
			}
			if (node.type === 'hardBreak') {
				return '<br />';
			}
			if (node.type === 'image') {
				const src = esc((node.attrs?.src as string) ?? '');
				const alt = node.attrs?.alt ? esc(node.attrs.alt as string) : '';
				const titleAttr = node.attrs?.title
					? ` title="${esc(node.attrs.title as string)}"`
					: '';
				return `<img src="${src}" alt="${alt}"${titleAttr} />`;
			}
			return '';
		})
		.join('');
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

/**
 * Convert a BlogContentDoc (TipTap JSON string) to an HTML string.
 * Returns an empty string if `docJson` is not valid JSON or fails schema validation.
 */
export function blogContentDocJsonToHtml(docJson: string): string {
	let raw: unknown;
	try {
		raw = JSON.parse(docJson);
	} catch {
		return '';
	}

	const parsed = BlogContentDocSchema.safeParse(raw);
	if (!parsed.success) return '';

	return blogContentDocToHtml(parsed.data);
}

/**
 * Convert an already-parsed BlogContentDoc to HTML.
 */
export function blogContentDocToHtml(doc: BlogContentDoc): string {
	return doc.content.map((block) => renderBlock(block as AnyNode)).join('\n');
}
