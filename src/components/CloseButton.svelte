<script>
	const { color = "black", top = "3rem", right = "3rem" } = $props();

	function goBack() {
		history.back();
	}
</script>

<button
	class="close-button"
	style={`--close-color: ${color}; --close-top: ${top}; --close-right: ${right};`}
	onclick={goBack}
	aria-label="Go back"
>
	<svg
		width="40"
		height="40"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
	>
		<line x1="18" y1="6" x2="6" y2="18"></line>
		<line x1="6" y1="6" x2="18" y2="18"></line>
	</svg>
</button>

<style>
	.close-button {
		position: absolute;
		top: var(--close-top);
		right: var(--close-right);
		z-index: 1000;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		color: var(--close-color);

		/* Remove round styles, just a simple icon */
		width: auto;
		height: auto;

		transition:
			transform 0.3s ease,
			opacity 0.3s;

		&:hover {
			transform: rotate(90deg); /* Nice interactive effect for an X */
			opacity: 0.6;
		}
	}
</style>
