import HomePageClient from './HomePageClient';
import { fetchChannels } from '@/lib/serverApi';

export const revalidate = 3600;

export default async function HomePage() {
  const { channels, lastUpdated } = await fetchChannels();

  return <HomePageClient initialChannels={channels} initialLastUpdated={lastUpdated} />;
}