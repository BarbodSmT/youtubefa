import type { Metadata } from 'next';
import { iransans } from './fonts';
import StoreProvider from './StoreProvider';
import { ThemeProvider } from '../theme/ThemeProvider'; 
import AuthInitializer from '@/components/AuthInitializer';
export const metadata: Metadata = {
  title: {
    default: 'یوتیوب فارسی | کتابخانه کانال های فارسی',
    template: '%s | یوتیوب فارسی',
  },
  description: 'بزرگترین کتابخانه برای کشف و جستجوی کانال های یوتیوب فارسی زبان در دسته بندی های مختلف. کانال مورد علاقه خود را پیدا کنید.',
  keywords: ['یوتیوب فارسی', 'یوتیوب ایرانی', 'کانال یوتیوب', 'یوتیوبر ایرانی'],
  creator: 'YoutubeFa',
  publisher: 'YoutubeFa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={iransans.className}>
      <body>
        <StoreProvider>
          <AuthInitializer />
          <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}