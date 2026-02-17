<script lang="ts">
	import { page } from '$app/state';
	import CloseButton from '$components/CloseButton.svelte';

	const projects = {
		ssra: {
			name: 'SSRA',
			img: '/ssra2.png',
			subtitle: 'A website for a student association',
			demoUrl: 'https://ssra.nl'
		},
		'good-vibes': {
			name: 'Good Vibes Runclub',
			img: '/danique.png',
			subtitle: 'Runclub of Danique Hosmar',
			demoUrl: 'https://goodvibesrunclub.nl'
		},
		led: {
			name: 'Landelijke Econometristendag',
			img: '/led.png',
			subtitle: 'National Econometriciansday',
			demoUrl: 'https://leditbeyourday.nl'
		}
	} as const;

	type ProjectSlug = keyof typeof projects;

	const slug = (page.params?.slug ?? 'ssra') as ProjectSlug;
	const project = projects[slug];
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
			<h1 style="view-transition-name: project-title-{slug}; view-transition-class: vt-element">
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
			</h1>
			<p style="view-transition-name: project-subtitle-{slug}; view-transition-class: vt-element">{project.subtitle}</p>
		</header>

		<article class="project-description">
			<p>
				This is a detailed case study about <strong>{project.name}</strong>. Because we used the
				View Transition API, the image you clicked on the homepage expanded seamlessly to become
				this full-width header.
			</p>
			<div class="details-grid">
				<div class="detail-item">
					<h4>Client</h4>
					<span>{project.name}</span>
				</div>
				<div class="detail-item">
					<h4>Year</h4>
					<span>2023</span>
				</div>
				<div class="detail-item">
					<h4>Services</h4>
					<span>Design & Development</span>
				</div>
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
		p {
			margin-bottom: 2rem;
		}
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
