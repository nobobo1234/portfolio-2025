<script lang="ts">
	import Underlined from '$components/Underlined.svelte';
	import { tick } from 'svelte';
	import { page } from '$app/state';
    import { onNavigate } from '$app/navigation';

	const href = '/';
	let navEl: HTMLElement | undefined = $state();
    let navHeight = $state(0);
    let expandedHeight = $state(0);

	let isCondensed = $state(false);
	let activeId = $state('');
    let scrollY = $state(0);
    let innerHeight = $state(0);
    let isMobile = $state(false);
    let isMobileMenuOpen = $state(false);

    let isDark = $derived(page.url.pathname.startsWith('/blog/'));

    let flipRunning = false;

	const navItems = [
		{ id: 'about', label: 'about' },
		{ id: 'projects', label: 'projects' },
		{ id: 'writings', label: 'writings' },
		{ id: 'contact', label: 'contact' }
	];

    let collapseThreshold = $derived((expandedHeight || navHeight) + 12);

    onNavigate(() => {
        isMobileMenuOpen = false;
    });

    $effect(() => {
        const query = window.matchMedia('(max-width: 640px)');
        isMobile = query.matches;
        
        const handler = (e: MediaQueryListEvent) => (isMobile = e.matches);
        query.addEventListener('change', handler);
        return () => query.removeEventListener('change', handler);
    })

    $effect(() => {
        if (!isCondensed && navHeight > 0) {
            expandedHeight = navHeight;
        }
    });

    $effect(() => {
        const nextCondensed =  scrollY > collapseThreshold;
        const shouldBeConfused = isMobile || nextCondensed;

        // If the condensed state is changing run the flip animation
        if (shouldBeConfused !== isCondensed) {
            animateFlip(shouldBeConfused);
        }

        updateActiveSection();
    })

	const animateFlip = async (nextCondensed: boolean) => {
        if (!navEl || flipRunning) {
            isCondensed = nextCondensed;
            return;
        }

        // If the user prefers reduced motion, skip the animation
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            isCondensed = nextCondensed;
            return;
        }

        flipRunning = true;

        // Capture the initial positions and sizes of the items
        const items = Array.from(navEl.querySelectorAll('[data-nav-id]'));
        const first = new Map(items.map((el) => [el, el.getBoundingClientRect()]));

        // Update the state and wait for the DOM to update
        isCondensed = nextCondensed;
        await tick();

        // Capture the final positions and sizes of the items
        const last = new Map(items.map((el) => [el, el.getBoundingClientRect()]));

        // Create and run the animations
		const animations = items
			.map((el) => {
				const from = first.get(el);
				const to = last.get(el);
				if (!from || !to) return null;

				const dx = from.left - to.left;
                const dy = from.top - to.top;
                const sx = from.width / to.width;
                const sy = from.height / to.height;
                
                if (dx === 0 && dy === 0) return null;

                return el.animate(
                    [
                        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
                        { transform: 'translate(0, 0) scale(1, 1)' }
                    ],
                    {
                        duration: 480,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        fill: 'both'
                    }
                );
        })

        await Promise.all(animations.map(a => a?.finished).filter(Boolean));
		flipRunning = false;
	};

    const updateActiveSection = () => {
        const checkpoint = innerHeight * 0.45;
        let currentId = '';

        for (const item of navItems) {
            const el = document.getElementById(item.id);
            if (el) {
                const top = el.getBoundingClientRect().top;
                // If it's roughly in view, consider it active.
                if (top <= checkpoint) {
                    currentId = item.id;
                }
            }
        }
        activeId = currentId;
    }

    const onClick = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement | null;
        if (!target) return;

        target.style.setProperty('--click-x', `${e.clientX}px`);
		target.style.setProperty('--click-y', `${e.clientY}px`);
    }
</script>

<svelte:window bind:scrollY bind:innerHeight />

<nav 
    class="nav"
    class:is-condensed={isCondensed}
    class:is-mobile={isMobile}
    class:is-dark={isDark}
    class:is-mobile-menu-open={isMobileMenuOpen}
    bind:this={navEl}
    bind:offsetHeight={navHeight}
    aria-label="Primary"
>
	<a class="logo" data-sveltekit-preload-data="hover" {href} onclick={onClick}>
		<span>noah.</span>
	</a>

	<ul class="nav__items">
        <!-- Create a hamburger button only visible when isMobile is true -->
         {#if isMobile}

            <li class="nav__item">
                <button
                    aria-label="Toggle navigation"
                    class="nav__item-mobile is-mobile"
                    onclick={(e) => {
                        e.preventDefault();
                        isMobileMenuOpen = !isMobileMenuOpen;
                    }}
                >
                    <span class="nav__short hamburger-logo" aria-hidden="true">☰</span>
                </button>
            </li>
        {/if}
		{#each navItems as item}
			<li class="nav__item">
				<a
					href={`/#${item.id}`}
					aria-label={item.label}
					data-nav-id={item.id}
					class:is-active={activeId === item.id}
				>
					<span class="nav__label"><Underlined hasOutline={!isMobile}>{item.label}</Underlined></span>
					<span class="nav__short" aria-hidden="true">{item.label[0]}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.nav {
		padding: 0 3rem;
		max-width: 120rem;
		margin: 0 auto;
		width: 100%;
		z-index: 20;
		position: absolute;
		top: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
        background-color: var(--color-bg);
		transition:
			transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.35s ease,
			background-color 0.35s ease,
			box-shadow 0.35s ease,
			border-color 0.35s ease,
			padding 0.35s ease;

		.nav__items {
			list-style: none;
			display: flex;
			align-items: center;
			gap: 0;
			padding: 0;
			margin: 0;
            transition: all 0.3s ease;
		}

		.nav__item {
			font-size: 1.4rem;
            transition: all 0.3s ease;
		}

		.nav__item a {
			color: var(--color-text);
			text-decoration: none;
			position: relative;
			display: inline-flex;
			align-items: center;
		}

		.nav__item a.is-active {
			font-weight: 700;
		}

        .nav__item button:not(.is-mobile) {
            display: none;
        }

        .nav__item-mobile {
            border: none;
            background: none;
            padding: 0;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            font-size: 1.8rem;
        }
    } 

    .nav.is-mobile:not(.is-mobile-menu-open) .nav__item:not(:first-child) {
        max-height: 0;
        padding: 0;
        overflow: hidden;
    }

    .nav.is-mobile:not(.is-mobile-menu-open) .nav__items {
        gap: 0 !important;
        justify-content: flex-end;
        align-items: flex-end;
    }

    .nav.is-mobile .nav__short:not(.hamburger-logo) {
        display: none;
    }

	.nav.is-dark:not(.is-condensed) {
		background-color: var(--color-bg-dark);
		--color-bg: var(--color-bg-dark);
	}

	.nav.is-dark:not(.is-condensed) .logo,
	.nav.is-dark:not(.is-condensed) .nav__item a {
		color: white;
	}

	.nav__label {
		display: inline;
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
	}

	.nav__short {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 0;
		text-align: center;
		text-transform: lowercase;
		opacity: 0;
		transform: translateY(6px);
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
		overflow: hidden;
	}

	.nav:not(.is-condensed) .nav__item:not(:last-of-type) a::after {
		content: ',';
		font-family: 'Newsreader Variable';
		font-weight: 400;
		display: inline-block;
		margin-right: 0.4rem;
	}

	.logo {
		font-weight: bold;
		font-size: 2rem;
		padding: 1rem 0;
		text-decoration: none;
		color: var(--color-text);
	}

	.nav.is-condensed .nav__items {
		position: fixed;
		right: 2.5rem;
		top: 50%;
		transform: translateY(-50%);
		width: auto;
		margin: 0;
		max-width: none;
		padding: 0.75rem 0.9rem;
		background-color: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 2rem;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		text-align: center;

		flex-direction: column;
		align-items: center;
		gap: 0.75rem;

        @media only screen and (max-width: 640px) {
            right: 1rem;
        }
	}

    .nav.is-mobile.is-condensed .nav__items {
        top: 0rem;
        transform: translateY(0);
        border: 1px solid transparent;
        box-shadow: none;
        align-items: flex-end;
		backdrop-filter: blur(0px);
		-webkit-backdrop-filter: blur(0px);
		background-color: transparent;
    }

    .nav.is-mobile.is-mobile-menu-open .nav__items {
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
        top: 1rem;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		background-color: rgba(255, 255, 255, 0.6);
        padding: 0.5rem 1.5rem 1rem 1.5rem;
    }

    .nav:not(.is-mobile).is-condensed .logo {
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

	.nav.is-condensed .nav__item {
		font-size: 1.6rem;
    }

	.nav:not(.is-mobile).is-condensed .nav__label {
        display: none;
	}

	.nav.is-condensed .nav__short {
		opacity: 1;
		transform: translateY(0);
		width: 1.6rem;
	}

	.nav.is-condensed .nav__item a.is-active {
		font-weight: 700;
	}

	@media (prefers-reduced-motion: reduce) {
		.nav {
			transition: none;
		}
	}
</style>
