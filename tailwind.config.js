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
    'bg-yellow-400',
    'bg-gray-400',
    'bg-red-400',
    'bg-gray-200',
    'bg-gray-100',
    'border-gray-300',
    'border-gray-200',
    'divide-gray-300',
    'font-gt-america',
    'font-gt-america-mono',
    'font-quadrant',
    'font-quadrant-light'
  ]
} 