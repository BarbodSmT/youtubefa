'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  alpha,
  useTheme,
  Tooltip,
  Divider,
} from '@mui/material';
import { OpenInNew, PeopleAlt, Videocam, Visibility, Category as CategoryIcon, Tag as TagIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { YouTubeChannel } from '../types';
import { optimizeImageUrl } from '../utils/imageOptimization';
import { ChannelDetailModal } from './ChannelDetailModal';
import Image from 'next/image';
interface YouTubeChannelCardProps {
  youtubeChannel: YouTubeChannel;
  index: number;
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

const YoutubeChannelCard: React.FC<YouTubeChannelCardProps> = ({ youtubeChannel, index }) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.youtube.com/channel/${youtubeChannel.id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const optimizedBanner = optimizeImageUrl(youtubeChannel.bannerImage || '', { width: 400, height: 120 });
  const optimizedAvatar = optimizeImageUrl(youtubeChannel.avatar, { width: 160, height: 160 });
  

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        style={{ height: '100%' }}
      >
        <Card
          onClick={handleOpenModal}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: 4,
            cursor: 'pointer',
            backgroundColor: theme.palette.background.paper,
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            '&:hover': {
              transform: 'translateY(-10px)',
              boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {youtubeChannel.bannerImage && <CardMedia
              src={youtubeChannel.bannerImage}
              component={Image}
              height="120"
              image={optimizedBanner}
              alt={`${youtubeChannel.title} banner`}
              sx={{ objectFit: 'cover' }}
              loading="lazy"
              referrerPolicy="no-referrer"
            />}
            {optimizedAvatar && <Avatar
              src={optimizedAvatar}
              alt={youtubeChannel.title}
              slotProps={{ 
                img: {
                  referrerPolicy: "no-referrer"
                }
               }}
              sx={{
                width: 88,
                height: 88,
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: `5px solid ${theme.palette.background.paper}`,
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                zIndex: 2,
              }}
            />}
          </Box>
          <CardContent sx={{ flexGrow: 1, pt: 7, textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              {youtubeChannel.title}
            </Typography>

            {/* Category Section */}
            {youtubeChannel.category?.name && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 2 }}>
                  {youtubeChannel.category && <Chip label={youtubeChannel.category.icon + ' ' + youtubeChannel.category.name} size="small" sx={{mt: 1, color: youtubeChannel.category.color, backgroundColor: theme.palette.background.default}} />} 
              </Box>
            )}

            {/* Stats Section with Icons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-evenly', my: 2, width: '100%' }}>
              <Box sx={{ textAlign: 'center' }}>
                <PeopleAlt sx={{ color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatNumber(youtubeChannel.subscriberCount)}</Typography>
                <Typography variant="caption" color="text.secondary">مشترک</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Videocam sx={{ color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatNumber(youtubeChannel.videoCount)}</Typography>
                <Typography variant="caption" color="text.secondary">ویدیو</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Visibility sx={{ color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatNumber(youtubeChannel.viewCount)}</Typography>
                <Typography variant="caption" color="text.secondary">بازدید</Typography>
              </Box>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} /> 

            {/* Tags Section */}
            {youtubeChannel.tags && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 1, px: 1 }}>
                  <TagIcon sx={{ color: 'text.secondary', fontSize: '1.125rem' }} />
                  {youtubeChannel.tags?.slice(0, 3).map((tag, tagIndex) => (
                    <Chip
                      key={tagIndex}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{ borderColor: 'divider', color: 'text.secondary', borderRadius: '8px', backgroundColor: theme.palette.background.default }}
                    />
                  ))}
                </Box>
              </>
            )}

            <Tooltip title="باز کردن کانال یوتیوب" arrow>
              <IconButton
                size="small"
                onClick={handleChannelClick}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: alpha(theme.palette.common.black, 0.4),
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.common.black, 0.6),
                  },
                }}
              >
                <OpenInNew sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </CardContent>
        </Card>
      </motion.div>
      {isModalOpen && (
        <ChannelDetailModal
          open={isModalOpen}
          onClose={handleCloseModal}
          channelId={youtubeChannel.id}
        />
      )}
    </>
  );
};

export default React.memo(YoutubeChannelCard);
