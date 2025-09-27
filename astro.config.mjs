// @ts-check
import { defineConfig } from 'astro/config';
// import remarkToc from 'remark-toc';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  markdown: {    
    syntaxHighlight: 'prism'
  },
  // mardown: {
  //   remarkPlugins: [[remarkToc, {heading: 'toc', maxDepth: 3}]],
  //   rehypePlugins: []
  // },
  vite: {
    plugins: [tailwindcss()]
  }
});