import type { ProjectContentDoc, ProjectContentMark } from '$lib/content/project-content-schema';
import { ProjectContentDocSchema } from '$lib/content/project-content-schema';

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

function applyMarks(text: string, marks: ProjectContentMark[] | undefined): string {
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
// Node type aliases (mirrors shape of ProjectContentDocSchema types)
// ---------------------------------------------------------------------------

type AnyNode = {
	type: string;
	text?: string;
	attrs?: Record<string, unknown>;
	marks?: ProjectContentMark[];
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
			const inner = node.content ? node.content.map(renderBlock).join('') : '';
			return `<ol>${inner}</ol>`;
		}
		case 'listItem': {
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
			return '';
		})
		.join('');
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Convert a ProjectContentDoc (TipTap JSON) to an HTML string.
 * Returns an empty string if `docJson` is not valid JSON or fails schema validation.
 */
export function projectContentDocJsonToHtml(docJson: string): string {
	let raw: unknown;
	try {
		raw = JSON.parse(docJson);
	} catch {
		return '';
	}

	const parsed = ProjectContentDocSchema.safeParse(raw);
	if (!parsed.success) return '';

	return projectContentDocToHtml(parsed.data);
}

/**
 * Convert an already-parsed ProjectContentDoc to HTML.
 */
export function projectContentDocToHtml(doc: ProjectContentDoc): string {
	return doc.content.map((block) => renderBlock(block as AnyNode)).join('\n');
}
