import React from 'react';
import { Box, Typography } from '@mui/material';
import { YouTube } from '@mui/icons-material';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const iconSizeMap: Record<NonNullable<LogoProps['size']>, number> = {
  small: 24,
  medium: 28,
  large: 32,
};

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  const iconSize = iconSizeMap[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: showText ? 1 : 0.5,
      }}
    >
      {/* Apply inline width/height to SVG to prevent FOUC */}
      <YouTube
        sx={{
          fontSize: iconSize,
          color: 'error.main',
        }}
        style={{ width: iconSize, height: iconSize }} 
      />
      {showText && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: size === 'large' ? { xs: '1.1rem', sm: '1.25rem' } : { xs: '1rem', sm: '1.1rem' },
            whiteSpace: 'nowrap',
          }}
        >
          یوتیوب فارسی
        </Typography>
      )}
    </Box>
  );
};

export default Logo;