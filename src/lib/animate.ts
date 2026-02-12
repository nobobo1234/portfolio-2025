// animate.ts
// FROM https://dev.to/jasper-clarke/integrating-svelte-5-with-gsap-3-54no
import type { Action } from 'svelte/action';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

type AnimationType = keyof typeof gsap;

/**
 * Extended tween vars for GSAP with optional ScrollTrigger and SplitText support.
 * @extends GSAPTweenVars
 */
interface AnimationOptions extends GSAPTweenVars {
	/**
	 * The GSAP animation method to invoke (e.g., "to", "from").
	 */
	type?: AnimationType;

	/**
	 * Optional ScrollTrigger configuration for scroll-based animations.
	 */
	scrollTrigger?: ScrollTrigger.Vars;

	/**
	 * If provided, splits the target into `chars`, `words`, or `lines`.
	 */
	splitText?: 'chars' | 'words' | 'lines';

	/**
	 * An optional GSAP Timeline to insert the tween into. Defaults to standalone tween.
	 */
	tl?: GSAPTimeline;

	/**
	 * An option property that adds the delay / position within the timeline / tween
	 */
	when?: string | number;
}

/**
 * Creates a Svelte action for animating an element with GSAP.
 */
export const animate: Action<Element, AnimationOptions> = (
	node,
	{ type, scrollTrigger, splitText, tl, when = '>', ...args } = { type: 'to' }
) => {
	let method;
	if (!tl) {
		method = gsap[type as AnimationType] as
			| ((target: gsap.TweenTarget, vars: GSAPTweenVars) => GSAPTween)
			| undefined;
	} else {
		// Bind tl[type] to timeline, otherwise the function will behave
		// as gsap[type].
		if (type && tl[type]) {
			method = tl[type].bind(tl);
		}
	}

	if (!method) {
		console.warn(`GSAP method "${type}" does not exist.`);
		return;
	}

	// Choose splittedText if provided.
	let animatedEl;
	if (splitText) {
		const splitted = SplitText.create(node, { type: splitText });
		animatedEl = splitted[splitText];
	} else {
		animatedEl = node;
	}

	// Create the animation with ScrollTrigger if provided.
	const tween = method(
		animatedEl,
		{
			...args,
			scrollTrigger: scrollTrigger
				? {
						...scrollTrigger,
						trigger: scrollTrigger.trigger || node
					}
				: undefined
		},
		when
	);

	return {
		destroy() {
			// Kill the animation when the element is removed
			tween.kill();

			// If using ScrollTrigger, make sure to kill that instance too
			if (scrollTrigger && tween.scrollTrigger) {
				tween.scrollTrigger.kill();
			}
		}
	};
};

/**
 * Svelte action shorthand for a GSAP "from" tween.
 */
export const aniFrom: Action<Element, AnimationOptions> = (
	node,
	{ type = 'from', ...args } = { type: 'from' }
) => {
	return animate(node, { type, ...args });
};

/**
 * Svelte action shorthand for a GSAP "to" tween.
 */
export const aniTo: Action<Element, AnimationOptions> = (
	node,
	{ type = 'to', ...args } = { type: 'to' }
) => {
	return animate(node, { type, ...args });
};
