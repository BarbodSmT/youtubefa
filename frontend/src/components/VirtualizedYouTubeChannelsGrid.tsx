import React, { memo } from 'react';
import { Box, Grid } from '@mui/material';
import YouTuberCard from './YoutubeChannelCard';
import type { YouTubeChannel } from '../types';

interface VirtualizedYouTuberGridProps {
  youtubeChannels: YouTubeChannel[];
  containerHeight?: number;
}

const VirtualizedYouTuberGrid: React.FC<VirtualizedYouTuberGridProps> = memo(({ 
  youtubeChannels, 
  containerHeight = 600 
}) => {
  return (
    <Box sx={{ height: containerHeight, width: '100%', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {youtubeChannels.map((youtubeChannel, index) => (
          <Grid 
            key={youtubeChannel.id} 
            size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
          >
            <YouTuberCard youtubeChannel={youtubeChannel} index={index} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

VirtualizedYouTuberGrid.displayName = 'VirtualizedYouTuberGrid';

export default VirtualizedYouTuberGrid;
