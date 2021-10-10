# ProgNovel Plugins

A set of plugins inspired by ProgNovel components. Made with Svelte -> Web Component.

## `<novel-trivia></novel-trivia>`

Takes only `label` attribute. Novel Trivia plugin is a component made as partially hidden box that can be revealed via user cursor hover. Good to create an auxiliary information that is not getting in the way of the main content.

Example:

```html
<novel-trivia label="Trivia">
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae eum accusamus cupiditate
  quaerat fuga ratione aperiam voluptates dolorem pariatur odio, quo voluptatem aspernatur nostrum
  quam? Quaerat, perferendis! Excepturi, minus obcaecati?
</novel-trivia>
<script src="/dist/prognovel-plugins.umd.js"></script>
```

## `<authors-note></authors-note>`

Takes only `name` attribute. Author's Note plugin is a typical quote box to highlight comments by author of the content.

```html
<authors-note name="ProgNovel">
  Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae eum accusamus cupiditate
  quaerat fuga ratione aperiam voluptates dolorem pariatur odio, quo voluptatem aspernatur nostrum
  quam? Quaerat, perferendis! Excepturi, minus obcaecati?
</authors-note>
<script src="/dist/prognovel-plugins.umd.js"></script>
```

## `<affiliate-link></affiliate-link>`

A plugin made to generate affiliate link meant to be used with library [Webfunding.js](https://github.com/prognoveljs/webfunding). Affiliate Link plugin takes `label` attribute, `img` attribute to point a source of image to show as the side illustration, `id` attribute which will point out to Webfunding.js affiliate link ID, and `rate` attribute to show how much the affiliate referrer could get commision from subscribers they brought with them (make sure to show the same rate as how you'll configure it in Webfunding.js)

Currently, you can't add content to `<affiliate-link></affiliate-link>` slot.

**Note** that by itself `<affiliate-link></affiliate-link>` plugin only generate links to be used for Webfunding.js. You need to install Webfunding.js yourself.

Example:

```html
<affiliate-link
  label="ProgNovel"
  rate="10"
  img="/img/influencer.svg"
  id="affiliate"
></affiliate-link>
<script src="/dist/prognovel-plugins.umd.js"></script>

<!-- Install Webfunding.js too -->
<script src="https://cdn.jsdelivr.net/npm/webfunding/dist/webfunding-iife.js"></script>
<script>
  const { WebMonetization } = webfunding;

  new WebMonetization()
    .registerPaymentPointers([
      "$wallet.example.com/test-1#10",
      "$wallet.example.com/test-2#8",
      "$wallet.example.com/test-3#20",
      "$wallet.example.com/test-4#5",
    ])
    .registerDynamicRevshare("affiliate", "10%")
    .start();
</script>
```
