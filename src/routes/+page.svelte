<script lang="ts">
	import { aniFrom } from '$lib/animate';
	import { gsap } from 'gsap';
	import Underlined from '$components/Underlined.svelte';
	import SmallTitle from '$components/SmallTitle.svelte';
	import Project from '$components/Project.svelte';
	import ScrubLine from '$components/ScrubLine.svelte';
	import ArticleTitle from '$components/ArticleTitle.svelte';
	import type { Action } from 'svelte/action';
	import nameImage from '$lib/images/image.png';

	let tl = gsap.timeline();

	// The parallax effect: Starts moved UP by 20% (-20), and scrubs to 0 (natural position).
	// This creates a "heavy" feeling where the text moves slower than the scroll.
	const parallaxBig: Action = (node) => {
		return aniFrom(node, {
			yPercent: -20,
			ease: 'none',
			scrollTrigger: {
				trigger: node,
				start: 'top bottom',
				end: 'bottom center',
				scrub: true
			}
		});
	};
</script>

<svelte:head>
	<title>Noah - Creative Developer</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<header class="header">
	<h2
		use:aniFrom={{
			tl: tl,
			y: 30,
			opacity: 0,
			duration: 1,
			ease: 'power2'
		}}
	>
		<span>I make websites like I make music,</span>
		<span
			><Underlined i>singing</Underlined> and just a little bit <Underlined i
				>unpredictable</Underlined
			>.</span
		>
	</h2>
	<h4
		use:aniFrom={{
			tl: tl,
			opacity: 0,
			duration: 0.5,
			x: 20,
			ease: 'power4',
			splitText: 'words',
			stagger: 0.1,
			when: '=-0.5'
		}}
	>
		For anyone trying to feel like themselves online.
	</h4>
</header>

<section id="about" class="about">
	<div class="column-2">
		<h1 class="big-title" use:parallaxBig>
			Hi I'm
			<span>
				Noah
			</span>
		</h1>
		<p class="about__text">
			I make and design websites for people like you. Not just single pages, but spaces that reflect
			your personality. Good websites should feel like a second language you already spoke, not
			something that screams. I’ve been coding websites since I was 11. Mostly out of curiosity, but
			honestly, because I’ve always been a little obsessed. That part hasn’t really changed.
		</p>
	</div>
</section>

<ScrubLine />

<section id="projects" class="projects">
	<SmallTitle>
		some of the things I’ve built<br />
		along the way
	</SmallTitle>
	<div class="projects-list">
		<Project
			name="SSRA"
			slug="ssra"
			subtitle="A website for a student association"
			year={2023}
			type="wordpress website"
			img="/ssra2.png"
		/>
		<Project
			name="Good Vibes Runclub"
			slug="good-vibes"
			subtitle="Website for the runclub of Danique Hosmar"
			year={2023}
			type="html & css with strava integration"
			img="/danique.png"
		/>
		<Project
			name="National Econometriciansday"
			slug="led"
			subtitle="Website for the National Econometriciansday in the Netherlands"
			year={2025}
			type="framer-based website"
			img="/led.png"
		/>
	</div>
</section>

<section id="writings" class="writings">
	<SmallTitle>writings</SmallTitle>
	<ArticleTitle date="21-05-2025" slug="transformers"
		>On predicting phrasing with transformers.</ArticleTitle
	>
	<ArticleTitle date="21-05-2025" slug="svelte-5">On learning Svelte 5.</ArticleTitle>
	<ArticleTitle date="21-05-2025" slug="designing-users">On web designing users.</ArticleTitle>
</section>

<section class="contact" id="contact">
	<SmallTitle>contact</SmallTitle>
	<h2 class="contact__title">Let's make something that sounds like you</h2>
	<h2 class="contact__mail">noahvanboven@gmail.com</h2>
</section>

<style lang="scss">
	.contact {
		padding-top: 0rem;
		&__title {
			font-size: 3rem;
			margin-bottom: 2rem;

			/* Responsive Font */
			@media (max-width: 768px) {
				font-size: 2rem;
			}
		}

		&__mail {
			font-size: 2.5rem;
			font-weight: 400;
			/* Prevent overflow on small screens */
			word-break: break-all;
			@media (max-width: 768px) {
				font-size: 1.5rem;
			}
		}
	}

	header,
	section {
		padding: 6rem 3rem;
		width: 100%;
		max-width: 120rem;
		margin: 0 auto;

		/* Reduce padding on mobile */
		@media (max-width: 768px) {
			padding: 4rem 2rem;
		}
	}

	.writings,
	.contact {
		background-color: var(--color-bg-dark);
		color: white;
	}

	.projects {
		width: 100%;
	}

	.projects-list {
		display: flex;
		width: 100%;
		flex-direction: column;
		gap: 8rem;
		@media (max-width: 768px) {
			gap: 4rem;
		}
	}

	.header {
		/* CHANGED: Full height to push content below fold */
		min-height: 100vh;
		/* height: calc(100vh - 5rem); Removed to fix peek-through */

		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;

		h2 {
			display: flex;
			flex-direction: column;
			text-align: center;
			font-weight: 400;
			font-size: 3rem;
			color: var(--color-text);

			@media (max-width: 768px) {
				font-size: 1.8rem;
			}
		}

		h4 {
			font-weight: 400;
			margin-top: 1rem;
			font-size: 1rem;
			text-align: center;
			padding: 0 1rem;
		}
	}

	.about {
		.column-2 {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: 2rem;

			/* CHANGED: Stack columns on mobile */
			@media (max-width: 768px) {
				grid-template-columns: 1fr;
				gap: 2rem;
			}
		}

		.big-title {
			font-size: 12rem;
			font-weight: 600;
			text-align: right;

			/* CHANGED: Add margin to compensate for parallax lift (-20% of height) */
			/* 12rem * 0.2 = ~2.4rem. We use more to be safe. */
			margin-top: 5rem;

			/* Responsive Typography */
			@media (max-width: 1024px) {
				font-size: 8rem;
			}
			@media (max-width: 768px) {
				font-size: 4rem;
				text-align: left; /* Align left on mobile for readability */
				margin-top: 0; /* Less lift compensation needed on small screens/font */
			}
		}

		.about__text {
			font-size: 2rem;
			margin-top: 10rem;

			@media (max-width: 768px) {
				font-size: 1.2rem;
				margin-top: 2rem;
			}
		}
	}
</style>
