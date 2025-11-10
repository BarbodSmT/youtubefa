import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Avatar,
  CardMedia,
  useTheme,
  Button,
  Divider,
  Fade,
  Backdrop,
  Skeleton,
  Chip,
  alpha,
  IconButton,
} from '@mui/material';
import { OpenInNew, VideoLibrary, BarChart, People, Close } from '@mui/icons-material';
import type { YouTubeVideo } from '../types';
import { useGetChannelByIdQuery } from '../store';
import { optimizeImageUrl } from '../utils/imageOptimization';
import Image from 'next/image';
interface ChannelDetailModalProps {
  open: boolean;
  onClose: () => void;
  channelId: string;
}

const formatNumber = (num: number): string => {
  const persianLocale = 'fa-IR';
  if (num >= 1000000) {
    return `${(num / 1000000).toLocaleString(persianLocale, { maximumFractionDigits: 1 })} میلیون`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toLocaleString(persianLocale, { maximumFractionDigits: 0 })} هزار`;
  }
  return num.toLocaleString(persianLocale);
};

const VideoListItem: React.FC<{ video: YouTubeVideo }> = ({ video }) => {
  const theme = useTheme();
  return (
    <Box
      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank', 'noopener,noreferrer')}
      sx={{
        display: 'flex',
        gap: 2,
        mb: 2,
        alignItems: 'center',
        p: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <CardMedia
        component={Image}
        image={optimizeImageUrl(video.thumbnailUrl, { width: 240, height: 136 })}
        alt={video.title}
        sx={{ width: 120, height: 68, borderRadius: 2, objectFit: 'cover', flexShrink: 0 }}
      />
      <Box>
        <Typography sx={{ fontWeight: 600, mb: 0.5, textAlign: 'left' }}>{video.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(video.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>
    </Box>
  );
};

const ModalSkeletonContent: React.FC = () => (
    <Box>
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{p: { xs: 2, sm: 3, md: 4 }}}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: -8, mb: 2}}>
            <Skeleton variant="circular" width={120} height={120} sx={{border: '4px solid', borderColor: 'background.paper'}}/>
        </Box>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" height={24} />
        <Divider sx={{ my: 2 }} />
        <Skeleton variant="text" width="100%" height={80} />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'left' }}>
          آخرین ویدیوها
        </Typography>
        {Array.from(new Array(3)).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Skeleton variant="rectangular" width={120} height={68} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="50%" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
);


export const ChannelDetailModal: React.FC<ChannelDetailModalProps> = ({ open, onClose, channelId }) => {
  const theme = useTheme();
  const { data: channel, isLoading, isError } = useGetChannelByIdQuery(channelId, {
    skip: !open,
  });

  const modalStyle = {
    position: 'absolute' as const,
    top: '53%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '80%', md: '700px' },
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    p: 0,
    maxHeight: '85vh',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };
  
  const scrollableContentStyle = {
    overflowY: 'auto', 
    flex: '1 1 auto', 
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.light,
      borderRadius: '3px',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      }
    },
  };

  const handleChannelClick = () => {
    if (!channel) return;
    const url = `https://www.youtube.com/channel/${channel.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const videos = channel?.recentVideos ?? [];
  const tagsArray = channel?.tags ?? [];

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
         <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              zIndex: 10,
              color: 'white',
              backgroundColor: alpha(theme.palette.common.black, 0.4),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.black, 0.6),
              },
            }}
          >
            <Close />
          </IconButton>
          <Box sx={scrollableContentStyle}>
            {isLoading ? (
              <ModalSkeletonContent />
            ) : isError || !channel ? (
              <Box sx={{ p: 4 }}><Typography color="error">خطا در بارگذاری اطلاعات کانال.</Typography></Box>
            ) : (
              <>
                <CardMedia 
                  component={Image}
                  height="200"
                  image={optimizeImageUrl(channel.bannerImage || '', { width: 800, height: 400 })}
                  alt={`${channel.title} banner`}
                  sx={{ objectFit: 'cover' }}
                />
                <Box sx={{p: { xs: 2, sm: 3, md: 4 }}}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-end' }, gap: 2, mt: { xs: -6, sm: -8 }, mb: 2, textAlign: { xs: 'center', sm: 'left' } }}>
                    <Avatar src={optimizeImageUrl(channel.avatar, {width: 240, height: 240})} sx={{ width: { xs: 80, sm: 120 }, height: { xs: 80, sm: 120 }, border: '4px solid', borderColor: theme.palette.background.paper, flexShrink: 0 }} />
                    <Box sx={{ flexGrow: 1, pb: {sm: 1} }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1 rem' }}>
                        {channel.title}
                      </Typography>
                       {channel.category && <Chip label={channel.category.icon + ' ' + channel.category.name} size="small" sx={{mt: 1, color: channel.category.color, backgroundColor: theme.palette.background.default}} />} 
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<OpenInNew />}
                      onClick={handleChannelClick}
                      sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 }, alignSelf: { xs: 'stretch', sm: 'flex-end' }, mb: {sm: 1} }}
                    >
                      مشاهده
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Box sx={{textAlign: 'center'}}>
                          <People sx={{color: 'text.secondary'}}/>
                          <Typography sx={{ fontWeight: 700 }}>{formatNumber(channel.subscriberCount)}</Typography>
                          <Typography variant="caption" color="text.secondary">مشترک</Typography>
                      </Box>
                      <Box sx={{textAlign: 'center'}}>
                          <VideoLibrary sx={{color: 'text.secondary'}}/>
                          <Typography sx={{ fontWeight: 700 }}>{formatNumber(channel.videoCount)}</Typography>
                          <Typography variant="caption" color="text.secondary">ویدیو</Typography>
                      </Box>
                      <Box sx={{textAlign: 'center'}}>
                          <BarChart sx={{color: 'text.secondary'}}/>
                          <Typography sx={{ fontWeight: 700 }}>{formatNumber(channel.viewCount)}</Typography>
                          <Typography variant="caption" color="text.secondary">بازدید کل</Typography>
                      </Box>
                  </Box>
                  
                  <Typography sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{channel.description}</Typography>
                  
                  {tagsArray.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
                          {tagsArray.map(tag => <Chip key={tag} label={`#${tag}`} />)}
                      </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'left' }}>
                    آخرین ویدیوها
                  </Typography>

                  {videos.length > 0
                    ? videos.map((video) => <VideoListItem key={video.id} video={video} />)
                    : <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>ویدیویی برای نمایش یافت نشد.</Typography>
                  }
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

