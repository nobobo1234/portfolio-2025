<script lang="ts">
	import { aniFrom } from '$lib/animate';

	interface Props {
		name: string;
		subtitle: string;
		year: string | number;
		type: string;
		img: string;
		slug: string;
	}

	let { name, subtitle, year, type, img, slug }: Props = $props();

	function handleClick(e: MouseEvent & { currentTarget: HTMLAnchorElement }) {
		document.documentElement.style.setProperty('--click-x', `${e.clientX}px`);
		document.documentElement.style.setProperty('--click-y', `${e.clientY}px`);
	}
</script>

<div class="project">
	<div
		class="project__text"
		use:aniFrom={{ opacity: 0, y: -40, duration: 1, scrollTrigger: { start: 'top 80%' } }}
	>
		<span class="project__title" style="view-transition-name: project-title-{slug}; view-transition-class: vt-element">{name}</span>
		<span class="project__subtitle" style="view-transition-name: project-subtitle-{slug}; view-transition-class: vt-element">{subtitle}</span>
		<span class="project__type">{year} - {type}</span>

		<a
			href={`/project/${slug}`}
			class="project__see-more"
			onclick={handleClick}
			data-sveltekit-preload-data="hover"
		>
			See more <span class="arrow">&rightarrow;</span>
		</a>
	</div>

	<a
		href={`/project/${slug}`}
		class="project__ss"
		onclick={handleClick}
		data-sveltekit-preload-data="hover"
		use:aniFrom={{ opacity: 0, y: 40, duration: 1, scrollTrigger: { start: 'top 80%' } }}
	>
		<img class="project__img" src={img} alt={`Screenshot: ${name}`} />
	</a>
</div>

<style lang="scss">
	/* ... (Layout styles remain the same) ... */
	.project {
		display: flex;
		gap: 6rem;
		width: 100%;
		@media (max-width: 768px) {
			flex-direction: column;
			gap: 2rem;
		}
	}
	.project:nth-of-type(n + 2) .project__img {
		padding-top: 3rem;
	}
	.project:nth-of-type(n + 2) .project__text {
		justify-content: start;
	}
	@media (min-width: 769px) {
		.project:nth-of-type(2n) .project__ss {
			order: -1;
		}
	}
	.project__text {
		display: flex;
		width: 45%;
		flex-direction: column;
		justify-content: center;
		row-gap: 0.7rem;
		@media (max-width: 768px) {
			width: 100%;
		}
	}
	.project__title {
		font-family: var(--font-serif);
		font-weight: bold;
		font-size: 4rem;
		position: relative;
		width: fit-content;
        word-break: break-word;
        word-wrap: break-word;
        hyphens: auto;
	}

	.project__subtitle {
		font-size: 1rem;
		display: block;
		width: fit-content;
	}
	.project__ss {
		width: 55%;
		display: block;
		@media (max-width: 768px) {
			width: 100%;
		}
	}
	.project__img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
	}
	.project__type {
		font-family: var(--font-sans-serif);
		font-weight: 200;
		font-size: 1rem;
		color: #9ca3af;
		margin-bottom: 1rem;
	}

	/* CHANGED: New "See more" Styling */
	.project__see-more {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-text);

		/* Clean slate */
		padding: 0;
		border: none;
		background: transparent;

		/* Typography */
		font-family: var(--font-serif); /* Newsreader */
		font-style: italic;
		font-size: 1.4rem;
		text-transform: none; /* No Uppercase */

		cursor: pointer;
		transition: opacity 0.3s ease;

		/* The Arrow */
		.arrow {
			display: inline-block;
			transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
			font-style: normal; /* Keep arrow upright usually looks better, or remove to keep italic */
		}

		/* Hover Effects */
		&:hover {
			opacity: 0.7;
		}

		/* Slide arrow to the right on hover */
		&:hover .arrow {
			transform: translateX(5px);
		}
	}
</style>
