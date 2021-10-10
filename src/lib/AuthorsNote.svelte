<svelte:options tag="authors-note" />

<script lang="ts">
  export let name = "Someone";
</script>

<article>
  🪶<br />
  <strong>{name} <span>says</span></strong>
  <slot />
</article>

<style lang="scss">
  article {
    box-shadow: 0 2px 8px #0004, 0 4px 16px #0001;
    padding: 1em 0.7em;
    border-radius: 4px;
    margin: {
      top: 1em;
      right: -2em;
      left: -2em;
      bottom: 1em;
    }
    strong {
      display: block;
      font-size: 1.3em;
      margin: {
        top: 0.5em;
        bottom: 0.3em;
      }
      span {
        font-weight: 400;
      }
    }
  }
</style>
