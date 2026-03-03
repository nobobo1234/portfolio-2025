function toTransitionKey(input: string | null | undefined): string {
	const normalized = (input ?? '')
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^[-_]+|[-_]+$/g, '');

	return normalized || 'item';
}

function createRule(className: string, transitionName: string): string {
	return `.${className}{view-transition-name:${transitionName};view-transition-class:vt-element;}`;
}

export function buildProjectTransitionClasses(slug: string | null | undefined) {
	const key = toTransitionKey(slug);
	const titleClass = `vt-project-title-${key}`;
	const subtitleClass = `vt-project-subtitle-${key}`;

	return {
		titleClass,
		subtitleClass
	};
}

export function buildPostTransitionClasses(slug: string | null | undefined) {
	const key = toTransitionKey(slug);
	const titleClass = `vt-post-title-${key}`;
	const dateClass = `vt-post-date-${key}`;

	return {
		titleClass,
		dateClass
	};
}

export function buildProjectTransitionCss(keys: string[]) {
	return keys
		.map((key) => {
			const { titleClass, subtitleClass } = buildProjectTransitionClasses(key);
			return [
				createRule(titleClass, `project-title-${toTransitionKey(key)}`),
				createRule(subtitleClass, `project-subtitle-${toTransitionKey(key)}`)
			].join('\n');
		})
		.join('\n');
}

export function buildPostTransitionCss(keys: string[]) {
	return keys
		.map((key) => {
			const { titleClass, dateClass } = buildPostTransitionClasses(key);
			return [
				createRule(titleClass, `post-title-${toTransitionKey(key)}`),
				createRule(dateClass, `post-date-${toTransitionKey(key)}`)
			].join('\n');
		})
		.join('\n');
}
