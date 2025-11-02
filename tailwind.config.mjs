/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        spark: {
          teal: '#06B1A2',
          'teal-dark': '#048F84',
          'teal-alt': '#00A99E',
          eggshell: '#D9EADF',
          'eggshell-alt': '#E3EEE5',
          chartreuse: '#BFF13C',
          orange: '#FF572D',
          ink: '#063E3A',
          black: '#12110C',
          'gray-dark': '#2E2B28',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'system-ui', 'sans-serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
