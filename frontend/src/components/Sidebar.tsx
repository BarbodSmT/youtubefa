'use client';
import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider, Typography, Button, Drawer } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { logout } from '../store';
import { Home as HomeIcon, AdminPanelSettings, Login, AppRegistration, PostAdd } from '@mui/icons-material';

const Sidebar: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const handleClick = (path: string) => {
    router.push(path);
  };

  const menuItems = [
    { text: 'خانه', icon: <HomeIcon />, path: '/' },
  ];

  const adminItems = [
    { text: 'مدیریت درخواست ها', icon: <AdminPanelSettings />, path: '/admin/channel-approval' },
    { text: 'مدیریت دسته‌بندی ها', icon: <AdminPanelSettings />, path: '/admin/category-management' },
    { text: 'مدیریت کانال ها', icon: <AdminPanelSettings />, path: '/admin/channels-management' },
  ];
  const userItems = [
    { text: 'ثبت کانال', icon: <PostAdd />, path: '/submit-channel' },
  ];

  const authItems = [
      { text: 'ورود', icon: <Login />, path: '/login' },
      { text: 'ثبت نام', icon: <AppRegistration />, path: '/register' },
  ];

  return (
    <Box sx={{mt: 8}}>
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <ListItem 
            key={text} 
            onClick={() => handleClick(path)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      {user?.role === 'Admin' && (
        <List>
          {adminItems.map(({ text, icon, path }) => (
            <ListItem 
              key={text} 
              onClick={() => handleClick(path)}
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.action.hover,
                }
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      )}
      <Divider />

      <List>
        {userItems.map(({ text, icon, path }) => (
          <ListItem 
            key={text} 
            onClick={() => handleClick(path)}
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: (theme) => theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      {/* Mobile-only authentication section */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Divider />
        {user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {user?.name}
            </Typography>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              خروج
            </Button>
          </Box>
        ) : (
          <List>
            {authItems.map(({ text, icon, path }) => (
              <ListItem 
                key={text} 
                onClick={() => handleClick(path)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.action.hover,
                  }
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      </Box>
  );
};

export default Sidebar;