<script lang="ts">
    import { page } from "$app/state";
    import type { Page } from "@sveltejs/kit";

    const error = $derived(page.error);
</script>

<h1>404</h1>
<p>{error?.message || "Page not found"}</p>
