<script lang="ts">
	import CloseButton from '$components/CloseButton.svelte';
	import { buildPostTransitionClasses } from '$lib/view-transition';
	import type { PageProps } from './$types';

	const { data, params }: PageProps = $props();

	const slug = $derived(params?.slug ?? '');
	const transitionClasses = $derived(buildPostTransitionClasses(slug));

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<div class="blog-post">
	<CloseButton top="6rem" right="3rem" color="white" />
	<header class="blog-header">
		<h1 class={transitionClasses.titleClass}>{data.post.title}</h1>
		<span class={transitionClasses.dateClass}>{formatDate(data.post.publishedAt)}</span>
	</header>

	<article class="content">
		{@html data.post.contentHtml}
	</article>
</div>

<style lang="scss">
	.blog-post {
		min-height: 100vh;
		background-color: var(--color-bg-dark);
		color: white;
		padding: 10rem 3rem;
		max-width: 120rem;
		margin: 0 auto;
		width: 100%;
	}

	.blog-header {
		margin-bottom: 6rem;

		h1 {
			font-size: 6rem;
			font-weight: bold;
			line-height: 1.1;
			margin-bottom: 2rem;

            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;

			/* Responsive size */
			@media (max-width: 768px) {
				font-size: 3.5rem;
			}
		}

		span {
			font-size: 1.4rem;
			color: #9ca3af;
			font-family: var(--font-sans-serif);
		}
	}

	.content {
		font-size: 2rem;
		line-height: 1.6;
		max-width: 80rem;

		:global(p) {
			margin-bottom: 2rem;
		}

		:global(h2) {
			font-size: 3rem;
			font-weight: 700;
			margin: 3rem 0 1.5rem;
			line-height: 1.2;
		}

		:global(h3) {
			font-size: 2.4rem;
			font-weight: 600;
			margin: 2.5rem 0 1rem;
			line-height: 1.2;
		}

		:global(ul),
		:global(ol) {
			padding-left: 2.5rem;
			margin-bottom: 2rem;
		}

		:global(ul) {
			list-style: disc;
		}

		:global(ol) {
			list-style: decimal;
		}

		:global(li) {
			margin-bottom: 0.5rem;
		}

		:global(li > p) {
			margin-bottom: 0.5rem;
		}

		:global(img) {
			max-width: 100%;
			border-radius: 0.5rem;
			margin: 2rem 0;
			display: block;
		}

		:global(blockquote) {
			border-left: 4px solid #4b5563;
			padding-left: 1.5rem;
			margin: 2rem 0;
			color: #9ca3af;
			font-style: italic;
		}

		:global(pre) {
			background: #1f2937;
			border-radius: 0.5rem;
			padding: 1.5rem;
			overflow-x: auto;
			margin-bottom: 2rem;
			font-size: 1.4rem;
		}

		:global(code) {
			background: rgba(255, 255, 255, 0.1);
			border-radius: 0.25rem;
			padding: 0.1em 0.35em;
			font-size: 0.9em;
		}

		:global(pre code) {
			background: none;
			padding: 0;
			font-size: inherit;
		}

		:global(a) {
			color: white;
			text-underline-offset: 3px;
		}

		:global(hr) {
			border: none;
			border-top: 1px solid #374151;
			margin: 3rem 0;
		}

		@media (max-width: 768px) {
			font-size: 1.2rem;

			:global(h2) { font-size: 2rem; }
			:global(h3) { font-size: 1.6rem; }
			:global(pre) { font-size: 1rem; }
		}
	}
</style>
