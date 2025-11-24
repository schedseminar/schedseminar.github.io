// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'], theme: {
    extend: {
      colors: {
        europe: {DEFAULT: '#fafae8'},
        asia: {DEFAULT: '#d7ecfc'},
        america: {DEFAULT: '#f6ebe1'},
      },
    },
  }, plugins: [],
};