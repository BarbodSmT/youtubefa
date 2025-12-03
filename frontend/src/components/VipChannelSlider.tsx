'use client';
import React from 'react';
import { Box, Typography, Avatar, Chip, IconButton, useTheme, alpha, Paper, Stack } from '@mui/material';
import { Star, OpenInNew, PeopleAlt, Videocam, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { useGetVipChannelsQuery } from '@/store';
import type { YouTubeChannel } from '@/types';
import { optimizeImageUrl } from '@/utils/imageOptimization';
import { useRouter } from 'next/navigation';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

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

type VipChannelSliderProps = {
  initialVipChannels?: YouTubeChannel[];
};

const VipChannelSlider: React.FC<VipChannelSliderProps> = ({ initialVipChannels = [] }) => {
  const theme = useTheme();
  const router = useRouter();
  const { data: fetchedVipChannels = [], isLoading } = useGetVipChannelsQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });
  const vipChannels = fetchedVipChannels.length ? fetchedVipChannels : initialVipChannels;
  const [swiperInstance, setSwiperInstance] = React.useState<SwiperType | null>(null);

  if (isLoading && vipChannels.length === 0) {
    return (
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Paper
          sx={{
            borderRadius: { xs: 2, md: 4 },
            p: { xs: 2, md: 4 },
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            minHeight: { xs: 200, md: 300 },
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: { xs: '1rem', md: '1.5rem' } }}>
            در حال بارگذاری کانال‌ها...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!vipChannels || vipChannels.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: { xs: 2, md: 4 }, position: 'relative', width: '100%', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        <Box sx={{ position: 'relative', width: '100%' }}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView="auto"
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            loop={vipChannels.length > 1}
            onSwiper={setSwiperInstance}
            style={{
              paddingTop: '20px',
              paddingBottom: '50px',
              width: '100%',
            }}
          >
            {vipChannels.map((channel) => (
              <SwiperSlide
                key={channel.id}
                style={{
                  width: '90%',
                  maxWidth: '800px',
                }}
              >
                  <Paper
                    onClick={() => router.push(`/channels/${channel.id}`)}
                    sx={{
                      borderRadius: { xs: 2, md: 4 },
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                      width: '100%',
                      maxWidth: '100%',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.3)}`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: { xs: 120, sm: 160, md: 200 },
                        background: channel.bannerImage
                          ? `url(${optimizeImageUrl(channel.bannerImage)})`
                          : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                        },
                      }}
                      role="img"
                      aria-label={`تصویر بنر کانال ویژه ${channel.title}`}
                    >
                      <Chip
                        icon={<Star sx={{ color: theme.palette.warning.main, fontSize: { xs: 14, md: 18 } }} />}
                        label="ویژه"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: { xs: 8, md: 16 },
                          right: { xs: 8, md: 16 },
                          background: alpha(theme.palette.background.paper, 0.95),
                          backdropFilter: 'blur(10px)',
                          fontSize: { xs: '0.7rem', md: '0.9rem' },
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                          zIndex: 2,
                        }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.youtube.com/channel/${channel.id}`, '_blank');
                        }}
                        sx={{
                          position: 'absolute',
                          top: { xs: 8, md: 16 },
                          left: { xs: 8, md: 16 },
                          background: alpha(theme.palette.background.paper, 0.95),
                          backdropFilter: 'blur(10px)',
                          color: theme.palette.primary.main,
                          zIndex: 2,
                          '&:hover': {
                            background: theme.palette.background.paper,
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <OpenInNew sx={{ fontSize: { xs: 18, md: 24 } }} />
                      </IconButton>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: { xs: -30, md: -40 },
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 3,
                        }}
                      >
                        <Avatar
                          src={optimizeImageUrl(channel.avatar)}
                          alt={`تصویر پروفایل کانال ویژه ${channel.title}`}
                          slotProps={{
                            img: {
                              referrerPolicy: 'no-referrer',
                              loading: 'lazy',
                              title: `آواتار ${channel.title}`
                            },
                          }}
                          sx={{
                            width: { xs: 60, sm: 70, md: 80 },
                            height: { xs: 60, sm: 70, md: 80 },
                            border: `4px solid ${theme.palette.background.paper}`,
                            boxShadow: `0 4px 16px ${alpha(theme.palette.common.black, 0.2)}`,
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ pt: { xs: 5, md: 6 }, pb: { xs: 2, md: 3 }, px: { xs: 2, md: 3 } }}>
                      <Typography
                        variant="h5"
                        sx={{
                          textAlign: 'center',
                          fontWeight: 800,
                          mb: 1,
                          fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {channel.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textAlign: 'center',
                          mb: { xs: 2, md: 3 },
                          fontSize: { xs: '0.75rem', md: '0.875rem' },
                          lineHeight: 1.6,
                          px: { xs: 1, md: 2 },
                        }}
                      >
                        {channel.description?.slice(0, 300)}...
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={{ xs: 1, md: 3 }}
                        justifyContent="space-around"
                        sx={{
                          background: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: 2,
                          p: { xs: 1.5, md: 2 },
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <PeopleAlt sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: { xs: 18, md: 24 } }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', md: '1.25rem' } }}>
                            {formatNumber(channel.subscriberCount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                            مشترک
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Videocam sx={{ color: theme.palette.primary.main, mb: 0.5, fontSize: { xs: 18, md: 24 } }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '0.875rem', md: '1.25rem' } }}>
                            {formatNumber(channel.videoCount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                            ویدیو
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Paper>
                </SwiperSlide>
                
            ))}
          </Swiper>

          {vipChannels.length > 1 && (
            <>
              <IconButton
                onClick={() => swiperInstance?.slideNext()}
                sx={{
                  position: 'absolute',
                  right: { xs: 8, md: 20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  background: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  '&:hover': {
                    background: theme.palette.background.paper,
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => swiperInstance?.slidePrev()}
                sx={{
                  position: 'absolute',
                  left: { xs: 8, md: 20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  background: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.1)}`,
                  '&:hover': {
                    background: theme.palette.background.paper,
                    transform: 'translateY(-50%) scale(1.1)',
                  },
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
        </Box>
      </motion.div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: ${theme.palette.primary.main};
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: ${theme.palette.primary.main};
        }
      `}</style>
    </Box>
  );
};

export default VipChannelSlider;