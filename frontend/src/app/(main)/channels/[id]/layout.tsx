import React from 'react';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${params.id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'کانال یافت نشد',
      };
    }

    const channel = await response.json();

    return {
      title: `${channel.title} | کانال یوتیوب فارسی`,
      description: channel.description || `کانال یوتیوب ${channel.title} با ${channel.subscriberCount} مشترک`,
      keywords: [
        channel.title,
        'یوتیوب فارسی',
        'کانال یوتیوب',
        ...(channel.tags || []),
        channel.category?.name || '',
      ],
      openGraph: {
        title: `${channel.title} | کانال یوتیوب فارسی`,
        description: channel.description || `کانال یوتیوب ${channel.title}`,
        images: [
          {
            url: channel.avatar,
            width: 800,
            height: 800,
            alt: channel.title,
          },
        ],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${channel.title} | کانال یوتیوب فارسی`,
        description: channel.description || `کانال یوتیوب ${channel.title}`,
        images: [channel.avatar],
      },
      alternates: {
        canonical: `https://youtubefarsi.com/channels/${params.id}`,
      },
    };
  } catch (error) {
    return {
      title: 'کانال یوتیوب فارسی',
    };
  }
}

export default function ChannelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
