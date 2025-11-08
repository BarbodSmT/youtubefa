'use client';
import React, { use } from 'react';
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  Button,
  Divider,
  Skeleton,
  Chip,
  Container,
  Paper,
  IconButton,
  Grid,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { VideoLibrary, BarChart, People, ArrowForward, YouTube } from '@mui/icons-material';
import type { YouTubeVideo } from '@/types';
import { useGetChannelByIdQuery } from '@/store';
import { optimizeImageUrl } from '@/utils/imageOptimization';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { motion } from 'framer-motion';

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

const VideoCard: React.FC<{ video: YouTubeVideo; index: number }> = ({ video, index }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank', 'noopener,noreferrer')}
        sx={{
          cursor: 'pointer',
          height: '100%',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
          },
        }}
      >
        {video.thumbnailUrl && video.thumbnailUrl.trim() !== '' ? (
          <Box
            component="img"
            src={optimizeImageUrl(video.thumbnailUrl)}
            alt={video.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            sx={{
              width: '100%',
              height: 180,
              objectFit: 'cover',
              borderTopLeftRadius: theme.shape.borderRadius,
              borderTopRightRadius: theme.shape.borderRadius,
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 180,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <YouTube sx={{ fontSize: 48, color: 'grey.500' }} />
          </Box>
        )}
        <CardContent sx={{ pt: 2 }}>
          <Stack spacing={1}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {video.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(video.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const SkeletonContent: React.FC = () => (
  <Box sx={{ minHeight: '100vh' }}>
    <Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
    <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 1 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, mb: 4 }}>
          <Skeleton variant="circular" width={140} height={140} />
          <Box sx={{ flex: 1, width: '100%' }}>
            <Skeleton variant="text" width="60%" height={50} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mt: 1 }} />
          </Box>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
          {Array.from(new Array(3)).map((_, i) => (
            <Grid size={{xs:12 , sm:6, md:4}} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="50%" />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  </Box>
);

export default function ChannelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const theme = useTheme();
  const router = useRouter();
  const { id } = use(params);
  const { data: channel, isLoading, isError } = useGetChannelByIdQuery(id);

  const videos = channel?.recentVideos ?? [];
  const tagsArray = channel?.tags ?? [];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: channel?.title,
      description: channel?.description,
      image: channel?.avatar,
      url: `https://www.youtube.com/channel/${channel?.id}`,
      sameAs: [`https://www.youtube.com/channel/${channel?.id}`],
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/SubscribeAction',
          userInteractionCount: channel?.subscriberCount,
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: channel?.viewCount,
        },
      ],
    },
  };

  if (isLoading) {
    return <SkeletonContent />;
  }

  if (isError || !channel) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" color="error" sx={{ mb: 3, fontWeight: 600 }}>
            خطا در بارگذاری اطلاعات کانال
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            متاسفانه نتوانستیم اطلاعات این کانال را بارگذاری کنیم. لطفا دوباره تلاش کنید.
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowForward />}
            onClick={() => router.back()}
            size="large"
          >
            بازگشت
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Banner Section */}
        <Box
          sx={{
            height: 300,
            background: channel.bannerImage && channel.bannerImage.trim() !== ''
              ? `url(${optimizeImageUrl(channel.bannerImage)})`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)',
            },
          }}
        >
          <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                position: 'absolute',
                top: 20,
                left: 20,
                bgcolor: 'rgba(255,255,255,0.9)',
                '&:hover': { bgcolor: 'white' },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 1, pb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper elevation={6} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}>
              {/* Channel Header */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, mb: 4 }}>
                {channel.avatar && channel.avatar.trim() !== '' && (
                  <Avatar
                    src={optimizeImageUrl(channel.avatar)}
                    alt={channel.title}
                    slotProps={{
                      img: {
                        referrerPolicy: 'no-referrer',
                        loading: 'lazy'
                      },
                    }}
                    sx={{
                      width: 140,
                      height: 140,
                      border: `5px solid ${theme.palette.background.paper}`,
                      boxShadow: theme.shadows[8],
                    }}
                  />
                )}
                <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {channel.title}
                  </Typography>
                  {channel.category && (
                    <Chip
                      label={channel.category.icon + ' ' + channel.category.name}
                      size="medium"
                      sx={{
                        color: channel.category.color,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}
                    />
                  )}
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<YouTube />}
                  onClick={() => window.open(`https://www.youtube.com/channel/${channel.id}`, '_blank', 'noopener,noreferrer')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  مشاهده در یوتیوب
                </Button>
              </Box>

              {/* Stats */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{xs:12 , sm:4}}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 2,
                    }}
                  >
                    <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {formatNumber(channel.subscriberCount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      مشترک
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{xs:12 , sm:4}}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 2,
                    }}
                  >
                    <VideoLibrary sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {formatNumber(channel.videoCount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ویدیو
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{xs:12 , sm:4}}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 2,
                    }}
                  >
                    <BarChart sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {formatNumber(channel.viewCount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      بازدید
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Description */}
              {channel.description && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    درباره کانال
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                      color: 'text.secondary',
                    }}
                  >
                    {channel.description}
                  </Typography>
                </Box>
              )}

              {/* Tags */}
              {tagsArray.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    برچسب‌ها
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tagsArray.map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="medium"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              <Divider sx={{ my: 4 }} />

              {/* Videos Section */}
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  آخرین ویدیوها
                </Typography>
                {videos.length > 0 ? (
                  <Grid container spacing={3}>
                    {videos.map((video, index) => (
                      <Grid size={{xs: 12, sm: 6, md: 4}} key={video.id}>
                        <VideoCard video={video} index={index} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 2,
                    }}
                  >
                    <VideoLibrary sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      هیچ ویدیویی برای نمایش وجود ندارد
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}
