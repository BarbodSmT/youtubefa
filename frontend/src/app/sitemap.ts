import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://utubefa.com';

  // Static URLs that should always be in the sitemap
  const staticUrls: MetadataRoute.Sitemap = [
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
  ];

  // Try to fetch dynamic channel URLs
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://utubefa.com';

    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not set, returning static sitemap only');
      return staticUrls;
    }

    const response = await fetch(`${apiUrl}/api/channels`, {
      cache: 'no-store',
      next: { revalidate: 3600 }, // Revalidate every hour
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      console.warn(`API returned status ${response.status}, returning static sitemap only`);
      return staticUrls;
    }

    const data = await response.json();
    const channels = data.channels || [];

    const channelUrls = channels.map((channel: { id: string }) => ({
      url: `${baseUrl}/channels/${channel.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticUrls, ...channelUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static URLs if API fetch fails
    return staticUrls;
  }
}
