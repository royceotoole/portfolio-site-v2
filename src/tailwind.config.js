/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gray-350': 'rgb(182, 188, 197)',
        'architecture': '#B9BE16',
        'objects': '#BBB1E9',
        'visual': '#F4411A',
      },
      fontFamily: {
        'gt-america': ['GT-America', 'sans-serif'],
        'gt-america-mono': ['GT-America-Mono', 'monospace'],
        'quadrant': ['Quadrant', 'serif'],
      },
      maxWidth: {
        'screen-2xl': '1536px',
      },
    },
  },
  plugins: [],
  safelist: [
    // Colors
    'bg-architecture',
    'bg-objects',
    'bg-visual',
    'bg-gray-200',
    'bg-gray-100',
    'bg-white',
    'bg-black/15',
    'text-white',
    'from-black/15',
    'via-transparent',
    'to-transparent',
    
    // Typography
    'text-red-500',
    '!text-red-500',
    'font-bold',
    '!font-bold',
    'text-xs',
    'text-sm',
    'text-lg',
    'text-4xl',
    'tracking-wide',
    
    // Opacity
    'opacity-0',
    'opacity-30',
    'opacity-75',
    'opacity-100',
    'group-hover:opacity-75',
    'group-hover:opacity-100',
    
    // Borders
    'border',
    'border-t',
    'border-b',
    'border-l',
    'border-gray-350',
    'border-gray-200',
    'divide-y',
    'divide-gray-350',
    
    // Layout
    'fixed',
    'absolute',
    'relative',
    'inset-0',
    'top-0',
    'top-4',
    'top-20',
    'bottom-16',
    'bottom-4',
    'left-16',
    'left-4',
    'right-16',
    'right-4',
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
    'gap-1',
    'gap-2',
    'gap-4',
    'space-y-1',
    'space-y-8',
    'pt-[248px]',
    'pb-16',
    'pb-4',
    'pb-2',
    'px-16',
    'px-4',
    'py-1',
    'py-4',
    'mb-2',
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
    'grid',
    'grid-cols-1',
    'lg:grid-cols-2',
    '2xl:grid-cols-3',
    
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
    'block',
    'cursor-pointer',
    'first:pt-0',
    'last:pb-0',
    'aspect-video',
    'aspect-[3/2]',
    'object-cover',
    'transition-opacity',
    'bg-gradient-to-t',
    'group-hover:opacity-75',
    'group-hover:opacity-100',
    'group-hover:underline'
  ]
} 