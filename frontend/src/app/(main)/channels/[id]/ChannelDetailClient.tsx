'use client';

import React from 'react';
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
import type { YouTubeChannel, YouTubeVideo } from '@/types';
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

const VideoCard: React.FC<{ video: YouTubeVideo; index: number; channelTitle: string }> = ({ video, index, channelTitle }) => {
  const theme = useTheme();
  const publishDate = new Date(video.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        component="article"
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
            alt={`تصویر بند انگشتی ویدیو ${video.title} از کانال ${channelTitle}`}
            title={video.title}
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
            role="img"
            aria-label={`تصویر پیش‌فرض برای ویدیو ${video.title}`}
          >
            <YouTube sx={{ fontSize: 48, color: 'grey.500' }} />
          </Box>
        )}
        <CardContent sx={{ pt: 2 }}>
          <Stack spacing={1}>
            <Typography
              variant="subtitle1"
              component="h3"
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
            <Typography variant="caption" color="text.secondary" component="time" dateTime={video.publishedAt}>
              {publishDate}
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
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
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

type ChannelDetailClientProps = {
  channel: YouTubeChannel | null;
  isLoading?: boolean;
};

const ChannelDetailClient: React.FC<ChannelDetailClientProps> = ({ channel, isLoading = false }) => {
  const theme = useTheme();
  const router = useRouter();
  const videos = channel?.recentVideos ?? [];
  const tagsArray = channel?.tags ?? [];

  const structuredData = channel
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'خانه',
                item: 'https://utubefa.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'کانال‌های یوتیوب',
                item: 'https://utubefa.com/channels',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: channel.title,
                item: `https://utubefa.com/channels/${channel.id}`,
              },
            ],
          },
          {
            '@type': 'ProfilePage',
            mainEntity: {
              '@type': 'Person',
              name: channel.title,
              description: channel.description,
              image: channel.avatar,
              url: `https://www.youtube.com/channel/${channel.id}`,
              sameAs: [`https://www.youtube.com/channel/${channel.id}`],
              interactionStatistic: [
                {
                  '@type': 'InteractionCounter',
                  interactionType: 'https://schema.org/SubscribeAction',
                  userInteractionCount: channel.subscriberCount,
                },
                {
                  '@type': 'InteractionCounter',
                  interactionType: 'https://schema.org/WatchAction',
                  userInteractionCount: channel.viewCount,
                },
              ],
            },
          },
          ...(videos.map((video) => ({
            '@type': 'VideoObject',
            name: video.title,
            description: `ویدیو ${video.title} از کانال ${channel.title}`,
            thumbnailUrl: video.thumbnailUrl,
            uploadDate: video.publishedAt,
            contentUrl: `https://www.youtube.com/watch?v=${video.id}`,
            embedUrl: `https://www.youtube.com/embed/${video.id}`,
            publisher: {
              '@type': 'Person',
              name: channel.title,
              url: `https://www.youtube.com/channel/${channel.id}`,
            },
          })) || []),
        ],
      }
    : null;

  if (isLoading) {
    return <SkeletonContent />;
  }

  if (!channel) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" color="error" sx={{ mb: 3, fontWeight: 600 }}>
            کانال مورد نظر یافت نشد
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowForward />}
            onClick={() => router.push('/')}
            size="large"
          >
            بازگشت به صفحه اصلی
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      {structuredData && (
        <Script id="structured-data-channel" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box
          component="header"
          role="banner"
          sx={{
            height: 300,
            background:
              channel.bannerImage && channel.bannerImage.trim() !== ''
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
          aria-label={`تصویر بنر کانال ${channel.title}`}
        >
          <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
            <IconButton
              onClick={() => router.back()}
              aria-label="بازگشت به صفحه قبل"
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

        <Container maxWidth="lg" sx={{ mt: -10, position: 'relative', zIndex: 1, pb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper elevation={6} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}>
              <Box component="section" aria-labelledby="channel-title" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, mb: 4 }}>
                {channel.avatar && channel.avatar.trim() !== '' && (
                  <Avatar
                    src={optimizeImageUrl(channel.avatar)}
                    alt={`تصویر پروفایل کانال ${channel.title}`}
                    slotProps={{
                      img: {
                        referrerPolicy: 'no-referrer',
                        loading: 'lazy',
                        title: `آواتار ${channel.title}`,
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
                  <Typography id="channel-title" variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                    {channel.title}
                  </Typography>
                  {channel.category && (
                    <Chip
                      label={channel.category.icon + ' ' + channel.category.name}
                      size="medium"
                      aria-label={`دسته‌بندی: ${channel.category.name}`}
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

              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
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
                <Grid size={{ xs: 12, sm: 4 }}>
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

              {channel.description && (
                <Box component="section" aria-labelledby="about-section" sx={{ mb: 4 }}>
                  <Typography id="about-section" variant="h5" component="h2" sx={{ fontWeight: 700, mb: 2 }}>
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

              {tagsArray.length > 0 && (
                <Box component="section" aria-labelledby="tags-section" sx={{ mb: 4 }}>
                  <Typography id="tags-section" variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
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

              <Box component="section" aria-labelledby="videos-section">
                <Typography id="videos-section" variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
                  آخرین ویدیوها
                </Typography>
                {videos.length > 0 ? (
                  <Grid container spacing={3}>
                    {videos.map((video, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={video.id}>
                        <VideoCard video={video} index={index} channelTitle={channel.title} />
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
};

export default ChannelDetailClient;


