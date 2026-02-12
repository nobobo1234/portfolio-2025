<script lang="ts">
    import { aniFrom } from "$lib/animate";
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();
</script>

<h3
    class="small-title"
    use:aniFrom={{ opacity: 0, duration: 0.5, ease: 'power4', splitText: 'chars', stagger: 0.02, scrollTrigger: { start: 'top bottom', toggleActions: 'play none none none' } }}
>
    {@render children?.()}
</h3> 

<style lang="scss">
    .small-title {
        font-style: italic;
        font-weight: 300;
        font-size: 1.4rem;
        margin-bottom: 4rem;
    }
</style>
