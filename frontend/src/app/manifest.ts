import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'یوتیوب فارسی | کتابخانه کانال‌های یوتیوب فارسی',
    short_name: 'یوتیوب فارسی',
    description: 'بزرگترین کتابخانه برای کشف و جستجوی کانال‌های یوتیوب فارسی زبان',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FF0000',
    lang: 'fa',
    dir: 'rtl',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
