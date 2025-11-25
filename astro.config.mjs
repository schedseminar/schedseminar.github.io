import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://schedulingseminar.com',
  integrations: [tailwind()],
  typescript: {
    strict: false,
    shim: false,        // turns off Astro’s TS shims
    check: false        // disables type checking entirely
  }
});