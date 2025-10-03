import React from 'react';
import { Box, Typography } from '@mui/material';
import { YouTube } from '@mui/icons-material';
interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', showText = true }) => {
  
  const sizeMap = {
    small: { container: 24, icon: 12, text: '0.875rem' },
    medium: { container: 32, icon: 16, text: '1rem' },
    large: { container: 48, icon: 24, text: '1.5rem' }
  };
  
  const sizes = sizeMap[size];
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: showText ? 1 : 0 }}>
      <YouTube sx={{ width: '50px', height: '50px', color: 'red' }}/>
      {showText && (
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 500,
            color: 'lightred',
          }}
        >
          یوتیوب فارسی
        </Typography>
      )}
    </Box>
  );
};

export default Logo;