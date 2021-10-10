import sveltePreprocess from "svelte-preprocess";

const { scss } = sveltePreprocess;

export default {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: sveltePreprocess([scss]),
};
