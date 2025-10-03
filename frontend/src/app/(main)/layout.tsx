'use client';

import { useState } from 'react';
import { Box, Drawer, Toolbar, CssBaseline } from '@mui/material';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const DRAWER_WIDTH = 240;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header onMenuToggle={handleDrawerToggle} />

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        {/* TEMPORARY DRAWER for mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' }, // Only display on 'xs' screens
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* PERMANENT DRAWER for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' }, // Only display on 'sm' and larger
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open // Permanent drawer is always open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }, // Adjust width only on 'sm' and larger
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}