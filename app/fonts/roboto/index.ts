import localFont from 'next/font/local';

export const roboto = localFont({
  src: [
    {
      path: '../../../public/fonts/static/RobotoCondensed-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/static/RobotoCondensed-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/static/RobotoCondensed-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/static/RobotoCondensed-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/static/RobotoCondensed-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/static/RobotoCondensed-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-roboto',
  display: 'swap',
}); 