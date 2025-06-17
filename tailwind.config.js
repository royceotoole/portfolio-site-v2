/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'gt-america': ['GT-America', 'sans-serif'],
        'gt-america-mono': ['GT-America-Mono', 'monospace'],
        'quadrant': ['Quadrant', 'serif'],
      },
      maxWidth: {
        'screen-2xl': '1536px',
      }
    },
  },
  plugins: [],
  safelist: [
    'text-red-500',
    '!text-red-500',
    'font-bold',
    '!font-bold',
    'opacity-30',
    'opacity-100',
  ]
} 