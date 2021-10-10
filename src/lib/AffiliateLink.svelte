<svelte:options tag="affiliate-link" />

<script lang="ts">
  import { generateAffiliateLink } from "./utils/affiliate-link";

  export let label: string = "";
  export let id: string = "affiliate";
  export let img: string = "";
  let input: HTMLInputElement;
  let input_label = "Generate your affiliate link";

  let generatedLink = "";

  function createAffiliateLink() {
    generatedLink = generateAffiliateLink(input.value, id);
    showModal = true;
  }

  import { tick } from "svelte";

  let rate: string = "10%";
  let copied: boolean = false;

  let linkElement;
  let hasClickedYet = false;
  let selectedTips = 0;
  let previousSelectedTips = 0;
  function copyLink() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedLink);
    } else {
      linkElement.select();
      document.execCommand("copy");
    }
    copied = true;
  }

  function clickTips(index: number) {
    hasClickedYet = true;
    selectedTips = index;
  }

  const transition = {
    In() {
      const isLeft = selectedTips < previousSelectedTips;
      return {
        x: isLeft ? 12 : -12,
        duration: 275,
        // easing: cubicIn,
      };
    },
    Out() {
      const isLeft = selectedTips < previousSelectedTips;
      return {
        x: isLeft ? -6 : 6,
        duration: 125,
        // easing: cubicOut,
      };
    },
  };

  $: if (selectedTips) {
    tick().then(() => {
      previousSelectedTips = selectedTips;
    });
  }

  function tipsSelected(el: HTMLElement) {
    const parent = el.parentElement;
    if (hasClickedYet) parent.style.transition = "height 0.32s ease-in-out";
    const height = el.clientHeight;
    parent.style.height = height + "px";
  }

  import { windowLock, windowUnlock } from "./utils/window-lock";
  import { fly, scale, fade } from "svelte/transition";
  import { cubicIn, cubicOut } from "svelte/easing";

  let showModal: boolean = false;
  let padding: string = "24px 24px 64px";
  let width: number = 500;
  let top: string = "20%";
  let opacity: number = 0.35;
  let borderTop: boolean = false;
  let style: string = "";

  $: if (showModal === true) {
    windowLock();
  }
  $: if (showModal === false) {
    windowUnlock();
  }

  function handlePressKey(e) {
    if (!showModal) return;

    if (e.key === "Escape") close();
  }

  const close = () => {
    showModal = false;
  };
</script>

<article part="body" class="pg--affiliate-link">
  <img class="pg--image" src={img} width="100%" height="auto" alt="Instant affiliate link." />
  <section class="pg--content">
    <h3>Instant affiliate link</h3>
    <p>
      Promote
      <strong>{label}</strong>
      and enjoy ~10% of Coil subscription revenue from paying visitors you bring.
      <em>No sign-up or paperwork required.</em>
    </p>
    <div class="referrer-generator">
      <input
        bind:this={input}
        id="generate-link-input"
        autocomplete="off"
        type="text"
        placeholder="Enter your Interledger payment pointer address"
      />
      <button on:click={createAffiliateLink}>{input_label}</button>
    </div>
  </section>
</article>

<svelte:window on:keyup={handlePressKey} />
{#if showModal}
  <div
    in:fade={{ duration: 125, easing: cubicOut }}
    out:fade={{ duration: 450, easing: cubicIn }}
    class="overlay"
    style="opacity: {opacity};"
    on:click={() => close()}
  />

  <article
    class="pg--modal"
    class:borderTop
    in:scale={{ duration: 225, start: 0.8, opacity: 0, easing: cubicOut }}
    out:scale={{ duration: 325, start: 0.9, opacity: 0, easing: cubicIn }}
    style="padding: {padding}; --modalWidth: {width}px; --modalTop: {top}; {style}"
  >
    <div class:copied>
      {#if copied}
        Your affiliate link has been copied to clipboard!
      {:else}
        Here's your affiliate link:
      {/if}
    </div>
    <div class="affiliate-link">
      <input
        bind:this={linkElement}
        onfocus="this.select();"
        type="text"
        value={generatedLink}
        readonly
      />
      <span on:click={copyLink}> 📋 </span>
    </div>

    <div class="tips">
      <div class="head">
        💡 Tips
        <div>
          {#each Array(4).fill("") as _, index}
            <span class:selected={selectedTips === index} on:click={() => clickTips(index)} />
          {/each}
        </div>
      </div>
      <div class="body">
        {#if selectedTips === 0}
          <div
            class="tips-item"
            use:tipsSelected
            class:selected={selectedTips === 0}
            in:fly={transition.In()}
            out:fly={transition.Out()}
          >
            You will receive {rate} of revenue of Web Monetization subscribers clicking your affiliate
            link. Please note that you are not being paid by how much clicks you get, but instead the
            time spent by subscribers reading the novel you referred. It is recommended to promote good
            novels that you're confident people will follow through, and avoid annoying people with spam
            to maintain trust with fellow readers.
          </div>
        {:else if selectedTips === 1}
          <div
            class="tips-item"
            use:tipsSelected
            class:selected={selectedTips === 1}
            in:fly={transition.In()}
            out:fly={transition.Out()}
          >
            To get the most out of this affiliate link is to write book reviews you'd think people
            will happy reading. Dig hidden gems and start recommend them to fellow readers in the
            community!
          </div>
        {:else if selectedTips === 2}
          <div
            class="tips-item"
            use:tipsSelected
            class:selected={selectedTips === 2}
            in:fly={transition.In()}
            out:fly={transition.Out()}
          >
            The amount of money you'll get at first probably won't satisfy you, since likely there
            is very small of people who aware of the incoming web standard Web Monetization and even
            smaller of people who subscribe for it. <br /><br />But don't give up! There'a a
            beginning for everything - and you, yes you, are the very first people who will vanguard
            the likely shift of web economy with the birth of web standard Web Monetization, which
            in the future, will be a very serious contender of ads economy that currently sustains
            almost every corner of the web out there. And like every industry and community, those
            who spearhead the revolution will definitely be rewarded!
          </div>
        {:else if selectedTips === 3}
          <div
            class="tips-item"
            use:tipsSelected
            class:selected={selectedTips === 3}
            in:fly={transition.In()}
            out:fly={transition.Out()}
          >
            Now you're ready! What are you waiting for? Go promote the novel out there and good
            luck! 👍👍👍
          </div>
        {/if}
      </div>
    </div>
  </article>
{/if}

<style lang="scss">
  $font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Oxygen, Ubuntu, Cantarell,
    "Open Sans", "Helvetica Neue", sans-serif;
  .pg--affiliate-link {
    --width: 1000px;
    --primary-color-h: 16;
    --primary-color-s: 100%;
    --primary-color-l: 42%;
    --primary-color: hsl(var(--primary-color-h), var(--primary-color-s), var(--primary-color-l));
    --font-family: #{$font-family};
    width: var(--width);
    margin: 0 auto;
    margin-bottom: 128px;
    padding: 24px;
    background-color: var(--background-color, #fff);
    border: 1px solid #0002;
    box-shadow: 0 2px 8px #0002, 0 4px 16px #0001;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 3fr;
    grid-gap: 128px;
    border-radius: 8px;
    font-family: var(--font-family);

    .pg--image {
      transform: scale(1.8);
    }

    .pg-content {
      --bold-color: hsl(var(--primary-color-h), var(--primary-color-s), var(--color-light));
      --color-light: 72%;

      strong {
        color: var(--bold-color);
      }

      em {
        font-weight: 300;
      }
    }

    :global(html.light) & {
      box-shadow: 0 12px 24px #0002;

      .referrer-generator > button {
        background: hsl(var(--primary-color-h), var(--primary-color-s), 38%);
        filter: none;
      }
    }
  }

  .referrer-generator {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-gap: 8px;

    input[type="text"] {
      padding: 6px;
    }

    button {
      $padding: 18px;
      font-family: inherit;
      padding: {
        left: $padding;
        right: $padding;
      }
      border-radius: 2px;
      background: hsl(var(--primary-color-h), var(--primary-color-s), 42%);
      color: #fffd;
      border: none;
      user-select: none;

      &:not([disabled]) {
        cursor: pointer;
      }

      &:focus {
        outline: none;
      }
    }
  }

  @media screen and (max-width: 789px) {
    article {
      display: none;
    }
  }

  @import "misc/instant-affiliate-link";
  $zIndex: 999999;
  .pg--modal {
    --borderRadius: 4px;
    width: var(--modalWidth, 500px);
    position: fixed;
    top: var(--modalTop, 20%);
    min-height: 250px;
    left: calc(50% - (var(--modalWidth) / 2));
    background-color: var(--background-color, #fff);
    z-index: $zIndex;
    border-radius: var(--borderRadius);
    overflow: hidden;
    font-family: $font-family;

    &.borderTop {
      border-top: 2px solid var(--primary-color);
      border-radius: 0 0 var(--borderRadius) var(--borderRadius);
    }
  }

  @media screen and (max-width: 768px) {
    article {
      --modalWidth: 95vw !important;
    }
  }

  .overlay {
    z-index: $zIndex - 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
  }
</style>
