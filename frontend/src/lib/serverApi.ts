import type { YouTubeChannel } from '@/types';

const DEFAULT_API_BASE = 'http://api:8080';

const getApiBase = () => process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;

type ChannelListResponse = {
  data?: {
    channels?: { $values?: YouTubeChannel[] } | YouTubeChannel[];
    lastUpdated?: string;
  };
  channels?: YouTubeChannel[];
  lastUpdated?: string;
};

type ChannelResponse = {
  data?: YouTubeChannel;
  channel?: YouTubeChannel;
};

const parseChannels = (payload?: ChannelListResponse) => {
  if (!payload) {
    return { channels: [], lastUpdated: null as string | null };
  }

  const nestedChannels = payload.data?.channels;
  const flatChannels: YouTubeChannel[] =
    (Array.isArray(payload.channels) ? payload.channels : null) ||
    (Array.isArray(nestedChannels) ? nestedChannels : null) ||
    (nestedChannels && typeof nestedChannels === 'object' && '$values' in nestedChannels
      ? ((nestedChannels.$values || []) as YouTubeChannel[])
      : null) ||
    [];

  const lastUpdated = payload.data?.lastUpdated || payload.lastUpdated || null;

  return {
    channels: flatChannels,
    lastUpdated: lastUpdated ?? null,
  };
};

const parseChannel = (payload?: ChannelResponse) => {
  if (!payload) return null;
  return payload.data || payload.channel || null;
};

async function getJson<T>(path: string, init?: RequestInit & { next?: { revalidate?: number } }): Promise<T> {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}/api${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed for ${path} with status ${response.status}`);
  }

  return response.json();
}

export async function fetchChannels() {
  try {
    const payload = await getJson<ChannelListResponse>('/channels', {
      next: { revalidate: 3600 },
    });

    return parseChannels(payload);
  } catch (error) {
    console.error('Failed to fetch channels for SSR:', error);
    return { channels: [], lastUpdated: null as string | null };
  }
}

export async function fetchChannelById(id: string) {
  try {
    const payload = await getJson<ChannelResponse>(`/channels/${id}`, {
      next: { revalidate: 3600 },
    });
    return parseChannel(payload);
  } catch (error) {
    console.error(`Failed to fetch channel ${id}:`, error);
    return null;
  }
}


