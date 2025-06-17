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
        'gt-america': ['var(--font-gt-america)'],
        'gt-america-mono': ['var(--font-gt-america-mono)'],
        'quadrant': ['var(--font-quadrant)'],
      },
      maxWidth: {
        'screen-2xl': '1536px',
      }
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border)-(red|yellow|blue|gray)-(400|500)/,
    },
    {
      pattern: /opacity-(30|50|100)/,
    },
    {
      pattern: /font-(normal|medium|bold)/,
    },
    {
      pattern: /!?.*/,
      variants: ['hover'],
    }
  ]
} 