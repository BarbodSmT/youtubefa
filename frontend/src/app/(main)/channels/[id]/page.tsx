import { fetchChannelById } from '@/lib/serverApi';
import ChannelDetailClient from './ChannelDetailClient';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

type ChannelPageParams = {
  params: { id: string };
};

export default async function ChannelDetailPage({ params }: ChannelPageParams) {
  const { id } = params;
  const channel = await fetchChannelById(id);

  if (!channel) {
    notFound();
  }

  return <ChannelDetailClient channel={channel} />;
}
