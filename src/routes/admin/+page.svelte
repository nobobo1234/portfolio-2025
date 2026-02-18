<script lang="ts">
    import SmallTitle from "$components/SmallTitle.svelte";

</script>

<svelte:head>
    <title>Admin - Noah's Portfolio</title>
    <meta name="description" content="Admin dashboard for managing portfolio content." />
</svelte:head>

<div class="admin-container">
    <SmallTitle>admin dashboard</SmallTitle>
</div>

<style>
    .admin-container {
		padding: 6rem 3rem;
		width: 100%;
		max-width: 120rem;
		margin: 0 auto;

		/* Reduce padding on mobile */
		@media (max-width: 768px) {
			padding: 4rem 2rem;
		}
    }
</style>
