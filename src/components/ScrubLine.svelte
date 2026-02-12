<script lang="ts">
    import { aniFrom } from '$lib/animate'
</script>

<div 
    class="line"
    use:aniFrom={{
        width: 0,
        ease: 'none',
        scrollTrigger: {
            start: 'top bottom',
            end: 'bottom center',
            scrub: true
        }
    }}
></div>

<style lang="scss">
    .line {
        height: 1px;
        width: calc(100vw + 3rem);

        margin-left: calc((100vw - 120rem) / -2 - 3rem);
        @media only screen and (max-width: 120rem) {
            margin-left: -3rem;
        }
        background-color: black;
    }
</style>
