import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import VitePluginConditionalCompile from './VitePluginConditionalCompile.mjs';

import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [qwikdev()],
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
  vite: {
    plugins: [VitePluginConditionalCompile()]
  }
});