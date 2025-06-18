import localFont from 'next/font/local'

export const gtAmerica = localFont({
  src: [
    {
      path: '../styles/GT-America-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../styles/GT-America-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america',
  preload: true,
  display: 'swap',
})

export const gtAmericaMono = localFont({
  src: [
    {
      path: '../styles/GT-America-Mono-Regular.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america-mono',
  preload: true,
  display: 'swap',
})

export const quadrant = localFont({
  src: [
    {
      path: '../styles/QuadrantText-201218-Light.otf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-quadrant',
  preload: true,
  display: 'swap',
}) 