<script>
	import CloseButton from '$components/CloseButton.svelte';
	import { page } from '$app/state';

	const slug = page.params?.slug ?? '';
</script>

<div class="blog-post">
	<CloseButton top="6rem" right="3rem" color="white" />
	<header class="blog-header">
		<h1 style="view-transition-name: post-title-{slug}; view-transition-class: vt-element">On predicting phrasing with transformers.</h1>
		<span style="view-transition-name: post-date-{slug}; view-transition-class: vt-element">21-05-2025</span>
	</header>

	<article class="content">
		<p>
			This is where your blog post content goes. Because we used the
			<strong>View Transition API</strong>, the title flew here from the previous page, and the
			black background expanded from your mouse click.
		</p>
		<p>
			The typography here matches your main site because we are inheriting the global fonts defined
			in <code>app.css</code>.
		</p>
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

		p {
			margin-bottom: 2rem;
		}
		@media (max-width: 768px) {
			font-size: 1.2rem;
		}
	}
</style>
