import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Button, Typography } from '@mui/material';
import { Menu as MenuIcon, DarkMode, LightMode } from '@mui/icons-material';
import Logo from './Logo';
import { useAppTheme } from "../theme/ThemeProvider"
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const theme = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backdropFilter: 'blur(10px)',
        zIndex: 1500,
      }}
      dir="rtl"
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Logo />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
            {token ? (
              <>
                <Typography variant="h4" sx={{ mr: 1, py: 2, fontSize: '1rem', alignItems: 'center' }}>
                  {user?.name}
                </Typography>
                <Button color="inherit" sx={{fontSize: '1rem'}} onClick={handleLogout}>
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" sx={{fontSize: '1rem'}} href="/login">
                  ورود
                </Button>
                <Button color="inherit" sx={{fontSize: '1rem'}} href="/register">
                  ثبت نام
                </Button>
              </>
            )}
          </Box>
          <IconButton color="inherit" onClick={theme.toggleTheme} aria-label="toggle theme">
            {theme.isDarkMode ? <DarkMode /> : <LightMode />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;