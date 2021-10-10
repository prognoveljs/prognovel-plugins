<svelte:options tag="novel-trivia" />

<script lang="ts">
  export let label = "";
  export let minWidth = 400;
  export let maxWidth = 400;
  export let width = 200;
</script>

<article
  style="width: {width}px; max-width: {maxWidth}px; 
  min-width: {minWidth}px;"
>
  <div class="wrapper">
    <strong>{label}</strong>
    <slot />
  </div>
</article>

<style lang="scss">
  article {
    --primary-color-h: 16;
    --primary-color-s: 100%;
    --primary-color-l: 42%;
    --label-font-family: Georgia, "Times New Roman", Times, serif;
    --body-font-family: Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    --primary-color: hsl(var(--primary-color-h), var(--primary-color-l), var(--primary-color-l));
    --background-color: #fff;
    --right: calc(100px + 2vw);
    --transform: 0px;
    --border: 2px;
    float: right;
    margin: 12px;
    margin-right: calc(var(--right) * -1);
    transform: translate3d(0, 0, 0);
    background-color: var(--background-color);
    color: var(--text-body-color);
    border-radius: 4px 0 0 4px;
    padding: 8px 16px;
    font-weight: 300;
    border: var(--border) solid #3334;
    // border-right: 0 solid transparent;
    transition: transform 0.325s ease-out;

    &:hover {
      border-color: hsla(
        var(--primary-color-h),
        var(--primary-color-s),
        var(--primary-color-l),
        0.66
      );
      transform: translate3d(calc((var(--right) + var(--transform) - var(--border)) * -1), 0, 0);

      * {
        opacity: 1;
      }
    }
    .wrapper {
      opacity: 0.48;
      font-family: var(--body-font-family);

      strong {
        font-family: var(--label-font-family);
        text-decoration: underline;
        font-size: 1.4em;
        display: block;
        padding-top: 12px;
        color: var(--primary-color);
      }
    }
  }
</style>
