<script lang="ts">
    import { page } from "$app/state";

    const status = $derived(page.status);
    const error = $derived(page.error);
</script>

<svelte:head>
    <title>{status} - Noah</title>
    <meta name="robots" content="noindex, nofollow" />
    <meta name="description" content={error?.message ?? "An error occurred"} />
</svelte:head>

<div class="error-page">
    <h1>{status}</h1>
    <p class="subtitle">this page has wandered off.</p>
    <p class="explanation">
        It might have been moved, or maybe it was never here to begin with.
        Either way, <a href="/">let's get you back home</a>.
    </p>
</div>

<style>
    .error-page {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        height: 100vh;
        background-color: var(--color-bg);
        color: var(--color-text);
        padding: 6rem 4rem;
    }

    .error-page h1 {
        font-size: 12rem;
    }

    .error-page .subtitle {
        font-size: 2rem;
        color: #8a8578;
        font-style: italic;
        font-weight: 400;
    }

    .error-page .explanation {
        margin-top: 2rem;
        font-size: 1.5rem;
        max-width: 30rem;
        line-height: 1.5;
    }

    a {
        color: var(--color-link);
        font-weight: 500;
        text-decoration: none;
        padding-bottom: 2px;
        border-bottom: 1px solid black;
    }
</style>
