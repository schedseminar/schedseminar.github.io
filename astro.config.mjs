import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ViktorKorladinov.github.io',
  integrations: [tailwind()],
  typescript: {
    strict: false,
    shim: false,        // turns off Astro’s TS shims
    check: false        // disables type checking entirely
  }
});