import type { StartQuoteDoc } from '$lib/content/home-content-schema';

const ITALIC_MARK_TYPE = 'italic';

export type StartQuoteRenderToken =
	| {
			type: 'text';
			text: string;
			italic: boolean;
	  }
	| {
			type: 'break';
	  };

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
