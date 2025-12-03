'use client';

import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Alert, Typography, Paper } from '@mui/material';
import Script from 'next/script';
import type { YouTubeChannel } from '@/types';
import { useDispatch } from 'react-redux';
import { useGetChannelsQuery, setChannels } from '@/store';
import type { AppDispatch } from '@/store';
import { useFilteredChannels } from '@/hooks/useFilteredChannels';
import YoutubeChannelCard from '@/components/YoutubeChannelCard';
import FilterBar from '@/components/FilterBar';
import YouTuberCardSkeleton from '@/components/YouTuberCardSkeleton';
import VipChannelSlider from '@/components/VipChannelSlider';

type HomePageClientProps = {
  initialChannels: YouTubeChannel[];
  initialLastUpdated: string | null;
};

const buildStructuredData = (channels: YouTubeChannel[]) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'یوتیوب فارسی',
      description: 'کتابخانه تخصصی معرفی کانال‌های یوتیوب فارسی زبان',
      url: 'https://utubefa.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://utubefa.com/?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'fa',
    },
    {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: channels.length,
      itemListElement: channels.slice(0, 50).map((channel, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://utubefa.com/channels/${channel.id}`,
        name: channel.title,
      })),
    },
  ],
});

const HomePageClient: React.FC<HomePageClientProps> = ({ initialChannels, initialLastUpdated }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: fetchedData,
    isLoading: isFetching,
    isError,
    error,
  } = useGetChannelsQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  const channels = fetchedData?.channels?.length ? fetchedData.channels : initialChannels;
  const lastUpdated = fetchedData?.lastUpdated || initialLastUpdated;

  useEffect(() => {
    if (channels?.length) {
      dispatch(setChannels(channels));
    }
  }, [channels, dispatch]);

  const { filteredChannels } = useFilteredChannels(channels);

  const structuredData = useMemo(() => buildStructuredData(channels), [channels]);
  const vipChannelsInitial = useMemo(() => channels.filter((channel) => channel.isVip), [channels]);

  const showLoadingState = (!initialChannels.length && isFetching) || (!channels.length && isFetching);

  const renderContent = () => {
    if (showLoadingState) {
      return (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {Array.from(new Array(9)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <YouTuberCardSkeleton />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (isError && !channels.length) {
      return (
        <Alert severity="error">
          خطا در بارگذاری کانال‌ها: {(error as { data?: { message?: string } })?.data?.message || 'خطای سرور'}
        </Alert>
      );
    }

    if (!filteredChannels.length) {
      return (
        <Paper sx={{ borderRadius: 8, textAlign: 'center', my: 8, py: 5 }}>
          <Typography variant="h6">هیچ کانالی برای نمایش یافت نشد.</Typography>
          <Typography color="text.secondary">فیلترها را تغییر دهید و دوباره تلاش کنید.</Typography>
        </Paper>
      );
    }

    return (
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {filteredChannels.map((channel, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={channel.id}>
            <YoutubeChannelCard youtubeChannel={channel} index={index} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <>
      <Script id="structured-data-home" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
        <VipChannelSlider initialVipChannels={vipChannelsInitial} />
        <FilterBar />
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            آخرین بروزرسانی: {new Date(lastUpdated).toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        )}
        {renderContent()}
      </Box>
    </>
  );
};

export default HomePageClient;


