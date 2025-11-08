import type { Metadata } from 'next';
import { iransans } from './fonts';
import StoreProvider from './StoreProvider';
import { ThemeProvider } from '../theme/ThemeProvider';
import AuthInitializer from '@/components/AuthInitializer';

export const metadata: Metadata = {
  metadataBase: new URL('https://utubefa.com'),
  title: {
    default: 'یوتیوب فارسی | کتابخانه کانال‌های یوتیوب فارسی',
    template: '%s | یوتیوب فارسی',
  },
  description:
    'بزرگترین کتابخانه برای کشف و جستجوی کانال‌های یوتیوب فارسی زبان در دسته‌بندی‌های مختلف. کانال مورد علاقه خود را پیدا کنید و از محتوای فارسی یوتیوب لذت ببرید.',
  keywords: [
    'یوتیوب فارسی',
    'یوتیوب ایرانی',
    'کانال یوتیوب',
    'یوتیوبر ایرانی',
    'کانال فارسی',
    'ویدیو فارسی',
    'محتوای فارسی',
    'یوتیوبر',
    'کتابخانه یوتیوب',
  ],
  creator: 'YoutubeFa',
  publisher: 'YoutubeFa',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://utubefa.com',
    siteName: 'یوتیوب فارسی',
    title: 'یوتیوب فارسی | کتابخانه کانال‌های یوتیوب فارسی',
    description:
      'بزرگترین کتابخانه برای کشف و جستجوی کانال‌های یوتیوب فارسی زبان در دسته‌بندی‌های مختلف',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'یوتیوب فارسی | کتابخانه کانال‌های یوتیوب فارسی',
    description:
      'بزرگترین کتابخانه برای کشف و جستجوی کانال‌های یوتیوب فارسی زبان در دسته‌بندی‌های مختلف',
  },
  alternates: {
    canonical: 'https://utubefa.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={iransans.className}>
      <head>
        <link rel="canonical" href="https://utubefa.com" />
        <meta name="google" content="notranslate" />
      </head>
      <body suppressHydrationWarning>
        <StoreProvider>
          <AuthInitializer />
          <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}