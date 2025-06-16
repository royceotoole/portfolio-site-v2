import localFont from 'next/font/local'

export const gtAmerica = localFont({
  src: [
    {
      path: '../../public/fonts/GT-America-Regular.OTF',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/GT-America-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america',
})

export const gtAmericaMono = localFont({
  src: [
    {
      path: '../../public/fonts/GT-America-Mono-Regular.OTF',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-gt-america-mono',
})

export const quadrant = localFont({
  src: [
    {
      path: '../../public/fonts/QuadrantText-201218-Light.otf',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-quadrant',
}) 