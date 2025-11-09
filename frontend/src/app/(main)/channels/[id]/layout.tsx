import React from 'react';
import type { Metadata } from 'next';

const formatSubscribers = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)} میلیون`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)} هزار`;
  }
  return count.toString();
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'کانال یافت نشد | یوتیوب فارسی',
        description: 'متأسفانه کانال مورد نظر یافت نشد.',
      };
    }

    const result = await response.json();
    const channel = result.data;

    const subscriberText = formatSubscribers(channel.subscriberCount);
    const videoCountText = channel.videoCount.toLocaleString('fa-IR');

    const metaDescription = channel.description
      ? `${channel.description.substring(0, 150)}${channel.description.length > 150 ? '...' : ''}`
      : `کانال یوتیوب ${channel.title} با ${subscriberText} مشترک و ${videoCountText} ویدیو. ${channel.category?.name ? `دسته‌بندی: ${channel.category.name}` : ''} تماشا و دنبال کردن کانال‌های یوتیوب فارسی`;

    const keywords = [
      channel.title,
      `کانال ${channel.title}`,
      'یوتیوب فارسی',
      'کانال یوتیوب',
      'یوتیوب',
      'ویدیوهای فارسی',
      ...(channel.tags || []).map((tag: string) => tag),
      channel.category?.name || '',
    ].filter(Boolean);

    return {
      title: `${channel.title} | کانال یوتیوب فارسی`,
      description: metaDescription,
      keywords: keywords.join(', '),
      authors: [{ name: channel.title }],
      openGraph: {
        title: `${channel.title} | کانال یوتیوب فارسی`,
        description: metaDescription,
        url: `https://youtubefarsi.com/channels/${id}`,
        siteName: 'یوتیوب فارسی',
        locale: 'fa_IR',
        type: 'profile',
        images: [
          {
            url: channel.avatar || '/default-avatar.png',
            width: 800,
            height: 800,
            alt: `تصویر پروفایل کانال ${channel.title}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${channel.title} | کانال یوتیوب فارسی`,
        description: metaDescription,
        images: [channel.avatar || '/default-avatar.png'],
      },
      alternates: {
        canonical: `https://youtubefarsi.com/channels/${id}`,
      },
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'کانال یوتیوب فارسی',
      description: 'مشاهده کانال‌های یوتیوب فارسی',
    };
  }
}

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
