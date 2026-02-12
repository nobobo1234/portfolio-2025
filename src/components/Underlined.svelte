<script lang="ts">
    import type { Snippet } from 'svelte';

    type Props = {
        children: Snippet,
        i?: boolean,
        hasOutline?: boolean,
    }

    let { children, i = false, hasOutline = true }: Props = $props();
</script>

{#if i}
    <i class="underlined" class:hasOutline={hasOutline}>{@render children?.()}</i>
{:else}
    <span class="underlined" class:hasOutline={hasOutline}>{@render children?.()}</span>
{/if}

<style lang="scss">
    @mixin stroke($color: #000, $size: 1px) {
      text-shadow:
        -#{$size} -#{$size} 0 $color,
         0        -#{$size} 0 $color,
         #{$size} -#{$size} 0 $color,
         #{$size}  0        0 $color,
         #{$size}  #{$size} 0 $color,
         0         #{$size} 0 $color,
        -#{$size}  #{$size} 0 $color,
        -#{$size}  0        0 $color;
    } 

    .underlined {
        position: relative;
        z-index: 1;

        &.hasOutline {
            @include stroke(var(--color-bg), 0.04em);
        }
    }

    .underlined:after {
        content: '';
        position: absolute;
        bottom: 0.10em;
        left: 0;
        width: 100%;
        height: 0.05em;
        background-color: currentColor;

        z-index: -1;

        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.4s ease;
    }

    .underlined:hover::after {
        transform: scaleX(1);
    }
</style>
