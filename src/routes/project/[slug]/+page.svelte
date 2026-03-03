<script lang="ts">
	import { buildProjectTransitionClasses } from '$lib/view-transition';
	import type { PageProps } from './$types';
	import CloseButton from '$components/CloseButton.svelte';

	const { data, params }: PageProps = $props();

	const slug = $derived(params.slug);
	const transitionClasses = $derived(buildProjectTransitionClasses(slug));
	const project = data.project;
</script>

<div class="project-page">
	<div class="hero-image-wrapper">
		<img
			src={project.img}
			alt={project.name}
			class="hero-image"
		/>
	</div>

	<div class="content-container">
		<CloseButton top="3rem" right="3rem" color="black" />

		<header class="project-header">
			<h1 class={transitionClasses.titleClass}>
				<span>{project.name}</span>
				<a
					class="project-demo-link"
					href={project.demoUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`Open ${project.name} demo in a new tab`}
					title="Open demo in new tab"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
						<path
							d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"
						/>
						<path d="M5 5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6H5V5z" />
					</svg>
				</a>
				{#if project.githubUrl}
					<a
						class="project-demo-link"
						href={project.githubUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Open ${project.name} on GitHub`}
						title="View source on GitHub"
					>
						<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
							<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
						</svg>
					</a>
				{/if}
			</h1>
			<p class={transitionClasses.subtitleClass}>{project.subtitle}</p>
		</header>

		<article class="project-description">
			{#if project.contentHtml}
				<div class="rich-content">{@html project.contentHtml}</div>
			{/if}
			<div class="details-grid">
				<div class="detail-item">
					<h4>Client</h4>
					<span>{project.client}</span>
				</div>
				<div class="detail-item">
					<h4>Year</h4>
					<span>{project.year}</span>
				</div>
				<div class="detail-item">
					<h4>Services</h4>
					<span>{project.services}</span>
				</div>
				{#if project.technology}
					<div class="detail-item">
						<h4>Technology</h4>
						<span>{project.technology}</span>
					</div>
				{/if}
			</div>
		</article>
	</div>
</div>

<style lang="scss">
	.project-page {
		width: 100%;
		min-height: 100vh;
		background-color: var(--color-bg);
		position: relative;
	}

	.hero-image-wrapper {
		width: 100%;
		height: 60vh;
		overflow: hidden;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.content-container {
		max-width: 120rem;
		margin: 0 auto;
		padding: 6rem 3rem;
		background-color: var(--color-bg);
		position: relative;
		z-index: 10;
	}

	/* ... rest of content styles ... */
	.project-header {
		margin-bottom: 4rem;
		h1 {
			font-size: 5rem;
			font-weight: bold;
			margin-bottom: 1rem;
			display: inline-flex;
			align-items: center;
			gap: 1.2rem;
            word-break: break-word;
            hyphens: auto;

			@media (max-width: 768px) {
				font-size: 3rem;
			}
		}
		p {
			font-size: 2rem;
			color: #555;
			font-family: var(--font-sans-serif);
		}
	}

	.project-demo-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.2rem;
		height: 3.2rem;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.05);
		color: inherit;
		text-decoration: none;
		transition: transform 0.2s ease, background 0.2s ease, opacity 0.2s ease;
		flex: 0 0 auto;

		svg {
			width: 1.6rem;
			height: 1.6rem;
			fill: currentColor;
		}

		&:hover {
			background: rgba(0, 0, 0, 0.12);
			transform: translateY(-1px);
		}

		&:focus-visible {
			outline: 2px solid currentColor;
			outline-offset: 3px;
		}
	}

	.project-description {
		font-size: 1.8rem;
		line-height: 1.6;
		max-width: 80rem;
	}

	.rich-content {
		font-family: var(--font-serif);
		font-size: 1.8rem;
		line-height: 1.75;
		margin-bottom: 4rem;
		color: var(--color-text);

		:global(p) { margin-bottom: 1.5em; }
		:global(h1) { font-size: 3rem; font-weight: 700; margin: 1.5em 0 0.5em; }
		:global(h2) { font-size: 2.4rem; font-weight: 700; margin: 1.5em 0 0.5em; }
		:global(h3) { font-size: 2rem; font-weight: 600; margin: 1.2em 0 0.4em; }
		:global(h4) { font-size: 1.7rem; font-weight: 600; margin: 1em 0 0.4em; }
		:global(h5) { font-size: 1.7rem; font-weight: 600; margin: 1em 0 0.4em; }
		:global(h6) { font-size: 1.7rem; font-weight: 600; margin: 1em 0 0.4em; }
		:global(ul) { list-style: disc; padding-left: 2em; margin-bottom: 1.5em; }
		:global(ol) { list-style: decimal; padding-left: 2em; margin-bottom: 1.5em; }
		:global(li) { margin-bottom: 0.4em; }
		:global(blockquote) {
			border-left: 3px solid color-mix(in srgb, var(--color-text) 25%, white);
			padding-left: 1.5em;
			margin: 1.5em 0;
			font-style: italic;
			color: color-mix(in srgb, var(--color-text) 70%, white);
		}
		:global(pre) {
			background: color-mix(in srgb, var(--color-text) 6%, white);
			border-radius: 0.5rem;
			padding: 1.2em 1.5em;
			overflow-x: auto;
			margin-bottom: 1.5em;
			font-size: 1.4rem;
		}
		:global(code) {
			font-family: var(--font-mono, monospace);
			font-size: 0.9em;
			background: color-mix(in srgb, var(--color-text) 8%, white);
			padding: 0.15em 0.4em;
			border-radius: 0.25rem;
		}
		:global(pre code) { background: none; padding: 0; }
		:global(hr) { border: none; border-top: 1px solid #ddd; margin: 2.5em 0; }
		:global(strong) { font-weight: 700; }
		:global(em) { font-style: italic; }
		:global(u) { text-decoration: underline; text-underline-offset: 3px; }
		:global(s) { text-decoration: line-through; }
		:global(a) { color: var(--color-text); text-decoration: underline; }
		:global(a:hover) { opacity: 0.7; }
	}
	.details-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		margin-top: 4rem;
		padding-top: 4rem;
		border-top: 1px solid #ddd;
		@media (max-width: 600px) {
			grid-template-columns: 1fr;
		}
		h4 {
			font-size: 1.2rem;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			color: #888;
			margin-bottom: 0.5rem;

            word-wrap: break-word;
            word-break: break-word;
            hyphens: auto;
		}
		span {
			font-size: 1.6rem;
		}
	}
</style>
