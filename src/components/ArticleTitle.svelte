<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		date: string;
		slug?: string;
	}

	let { children, date, slug }: Props = $props();

	// Default link if no slug is provided
	let href = $derived(slug ? `/blog/${slug}` : '#');

	function handleClick(e: MouseEvent & { currentTarget: HTMLAnchorElement }) {
		document.documentElement.style.setProperty('--click-x', `${e.clientX}px`);
		document.documentElement.style.setProperty('--click-y', `${e.clientY}px`);
	}
</script>

<div class="article-title__wrapper">
	<a {href} class="article-link" data-sveltekit-preload-data="hover" onclick={handleClick}>
		<h2 class="article-title" style="view-transition-name: post-title-{slug}; view-transition-class: vt-element">{@render children()}</h2>
		<span class="article-date" style="view-transition-name: post-date-{slug}; view-transition-class: vt-element">{date}</span>
	</a>
</div>

<style lang="scss">
	/* Remove default A tag styles that might interfere */
	.article-link {
		text-decoration: none;
		display: flex;
		width: 100%;
		align-items: baseline;
		color: inherit;
		cursor: pointer;

        @media only screen and (max-width: 640px) {
            flex-direction: column;
            gap: 1rem;
        }
	}

	.article-title {
		font-weight: bold;
		font-size: 3rem;
		margin-right: 1rem;
		color: white;

		/* Ensure it can be animated separately */
		display: inline-block;
		width: fit-content;

        word-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
	}

	.article-title__wrapper {
		display: flex;
		align-items: baseline;

		&:not(:last-of-type) {
			margin-bottom: 2rem;
		}

		/* Hover effect */
		&:hover .article-title {
			opacity: 0.8;
		}
	}

	.article-date {
		font-size: 1rem;
		color: #9ca3af;
		display: inline-block;

        @media only screen and (max-width: 640px) {
            order: -1;
        }
	}
</style>
