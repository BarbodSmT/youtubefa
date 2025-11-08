import React from 'react';
import { Box, Typography } from '@mui/material';
import { YouTube } from '@mui/icons-material';
interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ showText = true }) => {
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