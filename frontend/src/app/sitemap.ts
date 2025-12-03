import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://utubefa.com';

  try {
    // Use server-side API URL (Docker service name) for server-side requests
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:8080';
    const response = await fetch(`${apiUrl}/api/channels`, {
      cache: 'no-store',
    });

    const data = await response.json();
    const channels = data.channels || [];

    const channelUrls = channels.map((channel: { id: string }) => ({
      url: `${baseUrl}/channels/${channel.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/login`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/register`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/submit-channel`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      ...channelUrls,
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
