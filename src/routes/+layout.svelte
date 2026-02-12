<script lang="ts">
	import Header from '$components/Navigation/Header.svelte';
	import '../app.css';
	import { onMount, tick } from 'svelte';
	import type { Navigation } from '@sveltejs/kit';
	import Lenis from 'lenis';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { SplitText } from 'gsap/SplitText';
	// Import navigation helpers
	import { onNavigate, afterNavigate, beforeNavigate, disableScrollHandling } from '$app/navigation';

	gsap.registerPlugin(ScrollTrigger, SplitText);

	let lenis: Lenis;
	const scrollPositions = new Map<string, number>();

	const waitForLayout = async () => {
		await tick();
		await new Promise<void>((r) => requestAnimationFrame(() => r()));
		if (document.fonts?.ready) {
			try {
				await document.fonts.ready;
			} catch {
				// Ignore font loading failures
			}
		}
		const imgs = Array.from(document.images).filter((img) => !img.complete);
		if (imgs.length) {
			await Promise.all(imgs.map((img) => img.decode().catch(() => undefined)));
		}
		await new Promise<void>((r) => requestAnimationFrame(() => r()));
	};

	onMount(() => {
		lenis = new Lenis({ anchors: true });
		lenis.on('scroll', ScrollTrigger.update);
		
		const update = (time: number) => {
			lenis.raf(time * 1000);
		};
		
		gsap.ticker.add(update);
		gsap.ticker.lagSmoothing(0);

		// Sync Lenis to the current scroll position on first mount.
		lenis.scrollTo(window.scrollY, { immediate: true });

		return () => {
			lenis.destroy();
			gsap.ticker.remove(update);
		};
	});

	// Enable the View Transition API
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});

			// Use Web Animation API for the circle-expand effect.
			// CSS @keyframes with var() custom properties don't interpolate
			// correctly in Chrome's view-transition pseudo-elements.
			transition.ready.then(() => {
				const x = getComputedStyle(document.documentElement).getPropertyValue('--click-x') || '50vw';
				const y = getComputedStyle(document.documentElement).getPropertyValue('--click-y') || '50vh';

				const endRadius = Math.hypot(
					Math.max(parseFloat(x), window.innerWidth - parseFloat(x)),
					Math.max(parseFloat(y), window.innerHeight - parseFloat(y))
				);

				document.documentElement.animate(
					{
						clipPath: [
							`circle(0px at ${x} ${y})`,
							`circle(${endRadius}px at ${x} ${y})`
						]
					},
					{
						duration: 800,
						easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
						pseudoElement: '::view-transition-new(root)'
					}
				);
			}).catch(() => {
				// Transition was skipped/aborted — that's fine
			});
		});
	});

	beforeNavigate((navigation) => {
		if (navigation.willUnload) return;
		const fromPath = navigation.from?.url.pathname ?? location.pathname;
		if (lenis) {
			lenis.scrollTo(lenis.actualScroll, { immediate: true });
		}
		scrollPositions.set(fromPath, Math.round(window.scrollY));
	});

	afterNavigate(async (navigation) => {
		if (!lenis) return;

		if (navigation.type === 'enter') {
			lenis.scrollTo(window.scrollY, { immediate: true });
			return;
		}

		const pathname = navigation.to?.url.pathname ?? '';
		const isDetailPage = pathname.startsWith('/project/') || pathname.startsWith('/blog/');

		// Always open detail pages at the top, regardless of history state.
		if (isDetailPage) {
			lenis.scrollTo(0, { immediate: true });
			return;
		}

		// Restore saved scroll when navigating back/forward to a non-detail page.
		// This must come BEFORE the hash check, because popstate navigations
		// can carry a stale hash (e.g. "#about") that would otherwise hijack
		// scroll to the wrong position.
		if (navigation.type === 'popstate') {
			disableScrollHandling();

			const saved = scrollPositions.get(pathname) ?? 0;
			await waitForLayout();

			// If the URL has a hash, the browser will try to scroll to that
			// anchor element after our handler. Remove it from the URL to
			// prevent the browser from fighting our scroll restoration.
			if (window.location.hash) {
				history.replaceState(history.state, '', pathname);
			}

			window.scrollTo(0, saved);
			lenis.resize();
			ScrollTrigger.refresh();

			window.scrollTo(0, saved);
			lenis.scrollTo(saved, { immediate: true, force: true });
			return;
		}

		// Handle hash navigation (e.g. clicking an anchor link like #contact).
		if (navigation.to?.url.hash) {
            // TODO: Scrolling to #contact or #writings doesn't seem to work. It
            // scrolls to the end of projects for both.
			lenis.scrollTo(window.scrollY, { immediate: true });
			return;
		}

		// For normal link/goto navigations, start at the top.
		await waitForLayout();
		lenis.scrollTo(0, { immediate: true });
	});

	function captureClick(e: MouseEvent) {
		const x = e.clientX;
		const y = e.clientY;
		document.documentElement.style.setProperty('--click-x', `${x}px`);
		document.documentElement.style.setProperty('--click-y', `${y}px`);
	}

	let { children } = $props();
</script>

<svelte:window onclick={captureClick} />

<div class="app">
	<main>
		<Header />
		{@render children()}
	</main>

	<footer></footer>
</div>

<style>
	:global(::view-transition-group(root)) {
		animation-duration: 0.8s;
	}

	:global(::view-transition-new(root)) {
		/* Animation is driven by Web Animation API in onNavigate */
		animation: none;
		mix-blend-mode: normal;
		z-index: 2;
	}

	:global(::view-transition-old(root)) {
		z-index: 1;
		animation: none;
	}

	:global(::view-transition-group(.vt-element)) {
		z-index: 100;
		mix-blend-mode: normal;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
</style>
