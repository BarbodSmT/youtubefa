import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Skeleton,
  useTheme,
} from '@mui/material';

const YouTubeChannelCardSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Banner Skeleton */}
      <Skeleton variant="rectangular" height={120} sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />

      {/* Avatar Skeleton */}
      <Skeleton
        variant="circular"
        width={80}
        height={80}
        sx={{
          position: 'absolute',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: theme.palette.background.paper,
          border: `4px solid ${theme.palette.background.paper}`,
          zIndex: 2,
        }}
      />

      {/* FIX: Add skeleton for the top-right action button */}
      <Skeleton 
        variant="circular" 
        width={32} 
        height={32} 
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
        }} 
      />

      <CardContent sx={{ flexGrow: 1, pt: 7, textAlign: 'center' }}>
        {/* Name Skeleton */}
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1, mx: 'auto' }} />

        {/* Description Skeleton */}
        <Box sx={{ mb: 2, height: '40px' }}>
          <Skeleton variant="text" width="90%" height={20} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
        </Box>

        {/* Stats Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mb: 2, px: 1 }}>
          <Box>
            <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={50} height={16} sx={{ mx: 'auto' }} />
          </Box>
          <Box>
            <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={50} height={16} sx={{ mx: 'auto' }} />
          </Box>
          <Box>
            <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={50} height={16} sx={{ mx: 'auto' }} />
          </Box>
        </Box>

        {/* Tags Skeleton */}
        <Box sx={{ height: 32, display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2 }}>
          <Skeleton variant="rounded" width={50} height={24} sx={{ borderRadius: 16 }} />
          <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 16 }} />
          <Skeleton variant="rounded" width={40} height={24} sx={{ borderRadius: 16 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default YouTubeChannelCardSkeleton;