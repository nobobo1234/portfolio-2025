<script lang="ts">
	import { aniFrom } from '$lib/animate';
	import { gsap } from 'gsap';
	import Underlined from '$components/Underlined.svelte';
	import SmallTitle from '$components/SmallTitle.svelte';
	import Project from '$components/Project.svelte';
	import ScrubLine from '$components/ScrubLine.svelte';
	import ArticleTitle from '$components/ArticleTitle.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let tl = gsap.timeline();

	const safeJsonLd = (obj: unknown) =>
		JSON.stringify(obj).replace(/<\/script>/gi, '<\\/script>');

	// The parallax effect: Starts moved UP by 20% (-20), and scrubs to 0 (natural position).
	// This creates a "heavy" feeling where the text moves slower than the scroll.
	const parallaxBig = (node: HTMLElement) => {
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
	<title>Noah van Boven — Creative Developer</title>
	<meta name="description" content={data.heroSubtitle} />
	<meta property="og:title" content="Noah van Boven — Creative Developer" />
	<meta property="og:description" content={data.heroSubtitle} />
	<meta property="og:type" content="website" />
	<meta name="twitter:title" content="Noah van Boven — Creative Developer" />
	<meta name="twitter:description" content={data.heroSubtitle} />
	{@html `<script type="application/ld+json">${safeJsonLd({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Noah van Boven',
		email: data.contactEmail,
		jobTitle: 'Creative Developer',
		sameAs: ['https://www.linkedin.com/in/noahvanboven/']
	})}</script>`}
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
		<span>
			{#each data.startQuoteTokens as token}
				{#if token.type === 'break'}
					<br />
				{:else if token.italic}
					<Underlined i>{token.text}</Underlined>
				{:else}
					{token.text}
				{/if}
			{/each}
		</span>
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
		{data.heroSubtitle}
	</h4>
</header>

<section id="about" class="about">
	<div class="column-2">
		<h1 class="big-title" use:parallaxBig>
            <span class="smaller">
                Hi I'm
            </span>
			<span class="bigger"> Noah </span>
		<p class="about__text">{data.aboutSection}</p>
		</h1>
        <div class="image-column">
        <div class="about__image-wrapper">
            <div class="tape" aria-label="Decorative tape"></div>
            <img src={data.photoUrl ?? 'me.jpeg'} alt="Myself" class="about__image" />
        </div>
        </div>
	</div>
</section>

<ScrubLine />

<section id="projects" class="projects">
	<SmallTitle>
		some of the things I’ve built<br />
		along the way
	</SmallTitle>
	<div class="projects-list">
		{#each data.projects as p (p.slug)}
			<Project
				name={p.title}
				slug={p.slug}
				subtitle={p.subtitle}
				year={p.year}
				type={p.technology}
				img={p.bannerImgUrl}
			/>
		{:else}
			<p class="projects-empty">No projects yet.</p>
		{/each}
	</div>
</section>

<section id="writings" class="writings">
	<SmallTitle>writings</SmallTitle>
	{#each data.blogs as post (post.slug)}
		<ArticleTitle
			date={post.publishedAt.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
			slug={post.slug}
		>{post.title}</ArticleTitle>
	{:else}
		<p class="writings-empty">No posts yet.</p>
	{/each}
</section>

<section class="contact" id="contact">
	<SmallTitle>contact</SmallTitle>
	<h2 class="contact__title">Let's make something that sounds like you</h2>
	<h2 class="contact__mail"><a href="mailto:{data.contactEmail}">{data.contactEmail}</a></h2>
    <hr>
    <div class="contact__cta">
        <div>
            or find me on
             <a 
                href="https://www.linkedin.com/in/noahvanboven/" 
                target="_blank" 
                rel="noopener noreferrer"
                class="contact__cta-linkedin"
            >
                linkedin

                <!-- material icons -->
                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24"/></g><g><polygon points="6,6 6,8 14.59,8 5,17.59 6.41,19 16,9.41 16,18 18,18 18,6"/></g></svg>
            </a>
        </div>
        <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" class="contact__cta-cv">
            download cv

            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>
        </a>
    </div>
</section>

<style lang="scss">
    hr {
        margin: 2rem auto;
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

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

            a {
                color: inherit;
                text-decoration: none;
                border-bottom: 1px solid currentColor;
                padding-bottom: 2px;
                transition: opacity 0.2s ease;

                &:hover {
                    opacity: 0.5;
                }
            }
		}

        &__cta {
            margin-top: 2rem;
            font-size: 1.2rem;
            color: rgba(255, 255, 255, 0.2);
            // italic
            font-style: italic;

            display: flex;
            gap: 2rem;
            align-items: center;

            @media (max-width: 768px) {
                flex-direction: column;
                gap: 1rem;
                align-items: flex-start;
            }


            &-linkedin {
                color: rgba(255, 255, 255, 0.5);
                font-style: normal;
                font-size: 1.2rem;
                text-decoration: none;
                margin-left: 0.5rem;
                transition: transform 0.2s ease;
                display: inline-block;
                transform: scale(1);
                transition: transform 0.3s ease;

                svg {
                    width: 1rem;
                    height: 1rem;
                    fill: currentColor;
                    transition: transform 0.3s ease;
                }

                &:hover {
                    transform: scale(1.05);
                    color: rgba(255, 255, 255, 0.8);

                    svg {
                        transform: translate(2px, -2px);
                    }
                }
            }

            &-cv {
                border: 1px solid rgba(255, 255, 255, 0.5);
                padding: 0.3rem 0.6rem;
                font-size: 1rem !important;
                text-decoration: none;
                color: rgba(255, 255, 255, 0.5);
                transition: background-color transform 0.3s ease, color 0.3s ease;
                font-style: normal;
                transform: translateY(0);
                border-radius: 5px;

                svg {
                    width: 1rem;
                    height: 1rem;
                    fill: currentColor;
                    transition: transform 0.3s ease;
                    transform: translate(0, 2px);
                }

                &:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);

                    svg {
                        transform: translate(0, 4px);
                    }
                }
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

	:global(.projects-empty) {
		font-size: 1.2rem;
		color: #9ca3af;
		padding: 2rem 0;
	}

	.writings-empty {
		font-size: 1.2rem;
		color: rgba(255, 255, 255, 0.5);
		padding: 2rem 0;
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
			column-gap: 4rem;

			/* CHANGED: Stack columns on mobile */
			@media (max-width: 768px) {
				grid-template-columns: 1fr;
				gap: 3rem;
			}
		}

		.big-title {
            color: var(--color-text);
            display: flex;
            flex-direction: column;

            .smaller {
                font-style: italic;
                font-size: 4rem;
                color: #8a8578;
                font-weight: 400;

                @media only screen and (max-width: 500px) {
                    font-size: 3rem;
                }
            }

            .bigger {
                font-weight: 700;
                font-size: 12rem;
                color: var(--color-text);

                @media only screen and (max-width: 500px) {
                    font-size: 6rem;
                }
            }

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
			white-space: pre-line;
            font-weight: 400;

			@media (max-width: 768px) {
				font-size: 1.2rem;
			}
		}

        .image-column {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .about__image-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative; /* For positioning the tape */
            transform: rotate(1deg);
            transition: transform 0.3s ease;

            &:hover {
                transform: rotate(-1deg) scale(1.02);
            }

            .tape {
                position: absolute;
                top: -1rem;
                left: 50%;
                transform: translateX(-50%) rotate(-1deg);
                width: 5rem;
                height: 2rem;
                background: rgba(245,240,232,0.75);
                border: 1px solid rgba(0,0,0,0.08);
                z-index: 4;
            }
        }

        .about__image {
            width: 100%;
            max-width: 25rem;
            box-shadow: 4px 6px 24px rgba(0,0,0,0.18);
            object-fit: cover;


            @media (max-width: 768px) {
                max-width: 100%;
            }
        }
	}

</style>
