import localFont from 'next/font/local'

export const gtAmerica = localFont({
  src: [
    {
      path: '../../public/fonts/GTAmerica-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GTAmerica-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america',
})

export const gtAmericaMono = localFont({
  src: [
    {
      path: '../../public/fonts/GTAmericaMono-Regular.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america-mono',
})

export const quadrant = localFont({
  src: [
    {
      path: '../../public/fonts/Quadrant-Light.otf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-quadrant',
}) 