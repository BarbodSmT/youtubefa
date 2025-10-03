'use client';
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Grid,
  TextField,
  InputAdornment,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  MenuItem,
  Select,
  Avatar,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import {
  Edit,
  Delete,
  Search,
  Refresh,
  AdminPanelSettings,
  Link as LinkIcon,
  OpenInNew,
  CheckCircle,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import type { YouTubeChannel, UpdateChannelDto} from '@/types'
import {
  useGetChannelsQuery,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useGetCategoriesQuery,
} from "@/store";
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRouter } from "next/navigation";
import NextLink from 'next/link'
export default function AdminChannelsPage() {
  const theme = useTheme();
  const {
    data: channelsResponse,
    isLoading,
    isError,
    error,
    refetch: refetchChannels,
  } = useGetChannelsQuery();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (!token && user?.role !== "Admin") {
      router.push('/');
    }
  }, [user, router]);
  const { data: categoriesResponse } = useGetCategoriesQuery();

  const [updateChannel, { isLoading: isUpdating }] = useUpdateChannelMutation();
  const [deleteChannel, { isLoading: isDeleting }] = useDeleteChannelMutation();

  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<YouTubeChannel | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formErrors, setFormErrors] = useState<{ categoryId?: string }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const channels = useMemo(
    () => channelsResponse?.channels || [],
    [channelsResponse]
  );
  const categories = useMemo(
    () => categoriesResponse || [],
    [categoriesResponse]
  );

  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels;

    return channels.filter(
      (channel) =>
        channel.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        channel.channelUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (channel.tags &&
          channel.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    );
  }, [channels, searchQuery]);

  const paginatedChannels = useMemo(() => {
    return filteredChannels.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredChannels, page, rowsPerPage]);

  const handleOpenEditDialog = (channel: YouTubeChannel) => {
    setCurrentChannel(channel);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentChannel(null);
    setFormErrors({});
  };

  const handleSelectAll = useCallback(() => {
    if (selectedChannels.length === paginatedChannels.length) {
      setSelectedChannels([]);
    } else {
      setSelectedChannels(paginatedChannels.map((ch) => ch.id));
    }
  }, [selectedChannels, paginatedChannels]);

  const handleSelectChannel = (id: string, isSelected: boolean) => {
    setSelectedChannels((prev) =>
      isSelected ? [...prev, id] : prev.filter((chId) => chId !== id)
    );
  };

  const handleDeleteChannel = useCallback(
    async (id: string) => {
      try {
        await deleteChannel(id).unwrap();
        setSnackbar({ open: true, message: "کانال با موفقیت حذف شد!" });
        setSelectedChannels((prev) => prev.filter((chId) => chId !== id));
      } catch (err) {
        const errorMessage = (err as any)?.data?.message || "خطا در حذف کانال";
        setSnackbar({ open: true, message: errorMessage });
      }
    },
    [deleteChannel]
  );

  const handleBulkDelete = useCallback(async () => {
    const promises = selectedChannels.map((id) => deleteChannel(id).unwrap());
    try {
      await Promise.all(promises);
      setSnackbar({
        open: true,
        message: `${selectedChannels.length} کانال با موفقیت حذف شدند.`,
      });
      setSelectedChannels([]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: "یک یا چند مورد از حذف‌ها ناموفق بود.",
      });
    }
  }, [selectedChannels, deleteChannel]);

  const handleSubmit = async () => {
    if (!currentChannel) return;

    const errors: { categoryId?: string } = {};
    if (!currentChannel.categoryId) {
      errors.categoryId = "دسته‌بندی اجباری است";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const updateData: UpdateChannelDto = {
        title: currentChannel.title,
        description: currentChannel.description || "",
        categoryId: currentChannel.categoryId,
        tags: currentChannel.tags || [],
      };

      await updateChannel({
        id: currentChannel.id,
        data: updateData,
      }).unwrap();

      setSnackbar({ open: true, message: "کانال با موفقیت بروزرسانی شد!" });
      handleCloseDialog();
      refetchChannels();
    } catch (err) {
      const errorMessage =
        (err as any)?.data?.message || "خطا در ذخیره تغییرات";
      setSnackbar({ open: true, message: errorMessage });
    }
  };

  if (isLoading && !channelsResponse) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            در حال بارگذاری کانال‌ها...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <AdminPanelSettings
              sx={{ fontSize: 32, mr: 2, color: "primary.main" }}
            />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              مدیریت کانال‌ها
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            مدیریت و ویرایش کانال‌های موجود در سیستم
          </Typography>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="جستجو در کانال‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
            >
              <Tooltip title="بارگذاری مجدد لیست">
                <IconButton onClick={refetchChannels} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>

          {selectedChannels.length > 0 && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: alpha(theme.palette.error.main, 0.08),
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                عملیات گروهی ({selectedChannels.length} مورد انتخاب شده):
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  حذف همه
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedChannels([])}
                >
                  لغو انتخاب
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </motion.div>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          خطا در بارگذاری داده‌ها:{" "}
          {(error as any)?.data?.message || "یک خطای ناشناخته رخ داد"}
        </Alert>
      )}

      {filteredChannels.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedChannels.length > 0 &&
                        selectedChannels.length < paginatedChannels.length
                      }
                      checked={
                        paginatedChannels.length > 0 &&
                        selectedChannels.length === paginatedChannels.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>کانال</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>اطلاعات</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>دسته‌بندی</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>آمار</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    عملیات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedChannels.map((channel) => (
                  <TableRow key={channel.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedChannels.includes(channel.id)}
                        onChange={(e) =>
                          handleSelectChannel(channel.id, e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={channel.avatar}
                          alt={channel.title}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {channel.title}
                          </Typography>
                          <MuiLink
                            component={NextLink}
                            href={channel.channelUrl}
                            target="_blank"
                            rel="noopener"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              مشاهده در یوتیوب
                            </Typography>
                            <OpenInNew fontSize="small" sx={{ mr: 1 }} />
                          </MuiLink>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {channel.description}
                      </Typography>
                      {channel.tags && channel.tags.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {channel.tags.slice(0, 3).map((tag, idx) => (
                            <Chip key={idx} label={tag} size="small" />
                          ))}
                          {channel.tags.length > 3 && (
                            <Chip
                              label={`+${channel.tags.length - 3}`}
                              size="small"
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {channel.category?.name || "بدون دسته‌بندی"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        مشترکین: {channel.subscriberCount}
                      </Typography>
                      <Typography variant="body2">
                     ویدیوها: {channel.videoCount}
                      </Typography>
                      <Typography variant="body2">
                        بازدیدها: {channel.viewCount}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ویرایش">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(channel)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteChannel(channel.id)}
                          disabled={isDeleting}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredChannels.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="تعداد در هر صفحه:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} از ${count}`
            }
            sx={{ direction: "ltr" }}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              هیچ کانالی یافت نشد
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? "لطفاً عبارت جستجوی دیگری را امتحان کنید."
                : "هنوز هیچ کانالی در سیستم ثبت نشده است."}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refetchChannels}
            >
              تلاش مجدد
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* Edit Channel Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          ویرایش کانال
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ my: 2, display: "flex", alignItems: "center" }}>
            <Avatar
              src={currentChannel?.avatar}
              alt={currentChannel?.title}
              sx={{ width: 64, height: 64, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{currentChannel?.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {currentChannel?.channelUrl}
              </Typography>
            </Box>
          </Box>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <FormControl
              fullWidth
              error={!!formErrors.categoryId}
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                دسته‌بندی
              </Typography>
              <Select
                value={currentChannel?.categoryId || ""}
                onChange={(e) => {
                  if (currentChannel) {
                    setCurrentChannel({
                      ...currentChannel,
                      categoryId: Number(e.target.value),
                    });
                  }
                }}
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>
                  انتخاب دسته‌بندی
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.categoryId && (
                <FormHelperText>{formErrors.categoryId}</FormHelperText>
              )}
            </FormControl>

            <DialogActions sx={{ mt: 3, px: 0 }}>
              <Button
                variant="outlined"
                onClick={handleCloseDialog}
                disabled={isUpdating}
              >
                لغو
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={
                  isUpdating ? <CircularProgress size={20} /> : <CheckCircle />
                }
                disabled={isUpdating}
              >
                ذخیره تغییرات
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}
