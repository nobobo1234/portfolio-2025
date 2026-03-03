<script lang="ts">
	let isOpen = $state(false);

	const toggleMenu = () => (isOpen = !isOpen);
	const closeMenu = () => (isOpen = false);
    const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') closeMenu();
    };
    
    const clickOutside = (node: HTMLElement) => {
        const handleClick = (event: MouseEvent) => {
			if (isOpen && !node.contains(event.target as Node)) closeMenu();
		};

		document.addEventListener('click', handleClick, true);

		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class:open={isOpen} class="admin-bubble" use:clickOutside>
	<button
		class="admin-bubble__button"
		type="button"
		aria-label="Admin menu"
		aria-expanded={isOpen}
		aria-controls="admin-bubble-menu"
		onclick={toggleMenu}
	>
		<span class="admin-bubble__icon" aria-hidden="true">
			<svg
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M6 9l6 6 6-6" />
			</svg>
		</span>
	</button>

	<div
		id="admin-bubble-menu"
		class="admin-bubble__menu"
		class:is-open={isOpen}
		role="menu"
		aria-hidden={!isOpen}
	>
		<a
			class="admin-bubble__item"
			onclick={closeMenu}
			href="/admin"
			aria-label="Admin dashboard"
			role="menuitem"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.6"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				focusable="false"
			>
				<rect x="3" y="3" width="7" height="7" rx="1.5" />
				<rect x="14" y="3" width="7" height="7" rx="1.5" />
				<rect x="3" y="14" width="7" height="7" rx="1.5" />
				<rect x="14" y="14" width="7" height="7" rx="1.5" />
			</svg>
		</a>
		<form method="POST" action="/logout">
			<button
				type="submit"
				class="admin-bubble__item"
				aria-label="Logout"
				role="menuitem"
				onclick={closeMenu}
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
					focusable="false"
				>
					<path d="M10 4h-2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" />
					<path d="M15 12H7" />
					<path d="M15 8l4 4-4 4" />
				</svg>
			</button>
		</form>
	</div>
</div>

<style lang="scss">
	.admin-bubble {
		position: fixed;
		bottom: 2rem;
		right: 2.5rem;
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.admin-bubble__button {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.65);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: #111;
		display: grid;
		place-items: center;
		cursor: pointer;
		padding: 0;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;

		&:hover {
			transform: scale(1.06);
			box-shadow: 0 16px 34px rgba(0, 0, 0, 0.16);
		}

		&:active {
			transform: scale(0.98);
		}
	}

	.admin-bubble__icon {
		display: grid;
		place-items: center;
		transition: transform 0.2s ease;
	}

	.admin-bubble.open .admin-bubble__icon {
		transform: rotate(180deg);
	}

	.admin-bubble__menu {
		position: absolute;
		right: 0;
		bottom: 0;
		z-index: -1;
		display: grid;
		gap: 0.55rem;
		padding: 0.55rem;
		width: 3.5rem;
		padding-bottom: 4rem;
		border-radius: 2rem;
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		transform-origin: bottom right;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transform: translateY(0.75rem) scale(0.96);
		transition:
			opacity 0.3s ease,
			transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
			visibility 0s linear 0.35s;
	}

	.admin-bubble__menu.is-open {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
		transform: translateY(0) scale(1);
		transition:
			opacity 0.25s ease,
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
			visibility 0s;
	}

	.admin-bubble__menu form {
		margin: 0;
	}

	.admin-bubble__item {
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(0, 0, 0, 0.08);
		color: #111;
		height: calc(3.5rem - 0.55 * 2rem);
		width: calc(3.5rem - 0.55 * 2rem);
		cursor: pointer;

		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 10px 18px rgba(0, 0, 0, 0.14);
			background: rgba(255, 255, 255, 1);
		}
	}
</style>
