'use client';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Box, Grid, Alert, Typography, Paper } from '@mui/material';
import { useGetChannelsQuery, setChannels } from '@/store';
import type {AppDispatch} from '@/store'
import { useFilteredChannels } from '../../hooks/useFilteredChannels';
import YoutubeChannelCard from '@/components/YoutubeChannelCard';
import FilterBar from '@/components/FilterBar';
import YouTuberCardSkeleton from '@/components/YouTuberCardSkeleton';
import type { Metadata } from 'next';
function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, isError, error } = useGetChannelsQuery();

  const allChannels = data?.channels || [];
  
 const { filteredChannels } = useFilteredChannels(allChannels);

  useEffect(() => {
    if (data?.channels) {
      dispatch(setChannels(data.channels));
    }
  }, [data, dispatch]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Grid container spacing={3}>
          {Array.from(new Array(9)).map((_, index) => (
            <Grid size={{xs:12, sm: 6 ,md: 4, lg: 3}} key={index}>
              <YouTuberCardSkeleton />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (isError) {
      return <Alert severity="error">خطا در بارگذاری کانال‌ها: {(error as any)?.data?.message || 'خطای سرور'}</Alert>;
    }

    if (filteredChannels.length === 0) {
      return (
        <Paper sx={{borderRadius: 8,textAlign: 'center', my: 8,py: 5}}>
            <Typography variant="h6">هیچ کانالی برای نمایش یافت نشد.</Typography>
            <Typography color="text.secondary">ممکن است فیلتر های شما اشتباه باشد</Typography>
        </Paper>
      );
    }

    return (
      <Grid container spacing={3}>
        {filteredChannels.map((channel, index) => (
          <Grid size={{xs:12, sm: 6 ,md: 4, lg: 3}} key={channel.id}>
            <YoutubeChannelCard youtubeChannel={channel} index={index} />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <FilterBar  />
      {renderContent()}
    </Box>
  );
}

export default HomePage;

