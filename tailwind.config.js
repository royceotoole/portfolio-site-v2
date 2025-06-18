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
    // Colors
    'bg-yellow-400',
    'bg-gray-400',
    'bg-red-400',
    'bg-gray-200',
    'bg-gray-100',
    'bg-white',
    'bg-black/50',
    
    // Typography
    'text-red-500',
    '!text-red-500',
    'font-bold',
    '!font-bold',
    'text-xs',
    'text-sm',
    'text-4xl',
    'tracking-wide',
    
    // Opacity
    'opacity-30',
    'opacity-75',
    'opacity-100',
    
    // Borders
    'border',
    'border-t',
    'border-b',
    'border-l',
    'border-gray-300',
    'border-gray-200',
    'divide-y',
    'divide-gray-300',
    
    // Layout
    'fixed',
    'absolute',
    'relative',
    'inset-0',
    'top-0',
    'top-20',
    'bottom-16',
    'left-16',
    'right-16',
    'z-10',
    'z-40',
    'z-50',
    'w-full',
    'w-64',
    'w-72',
    'w-40',
    'w-20',
    'w-2',
    'h-2',
    'flex',
    'flex-1',
    'flex-shrink-0',
    'gap-2',
    'space-y-8',
    'pt-[248px]',
    'pb-16',
    'pb-4',
    'px-16',
    'px-4',
    'py-1',
    'py-4',
    'mb-3',
    'mb-8',
    'mb-12',
    'mt-8',
    'mx-8',
    'min-h-screen',
    
    // Flexbox & Grid
    'flex',
    'items-center',
    'justify-between',
    'justify-center',
    
    // Spacing
    'space-y-8',
    'gap-2',
    
    // Overflow
    'overflow-y-auto',
    'overflow-hidden',
    
    // Fonts
    'font-gt-america',
    'font-gt-america-mono',
    'font-quadrant',
    'font-quadrant-light',
    
    // Misc
    'invisible',
    'hidden',
    'cursor-pointer',
    'first:pt-0',
    'last:pb-0',
    'aspect-video',
    'object-cover',
    'rounded-lg',
    'transition-opacity'
  ]
} 