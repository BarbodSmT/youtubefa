'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  SelectAll,
  Search,
  Refresh,
  AdminPanelSettings,
  OpenInNew,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  useGetPendingSubmissionsQuery,
  useApproveSubmissionMutation,
  useRejectSubmissionMutation,
  useGetCategoriesQuery,
} from '@/store';
import type { Submission } from '@/types';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
export default function AdminApprovalPage() {
  const theme = useTheme();
  const { 
    data: submissionsResponse, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetPendingSubmissionsQuery();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const { 
    data: categories, 
  } = useGetCategoriesQuery();
  const [approveSubmission, { isLoading: isApproving }] = useApproveSubmissionMutation();
  const [rejectSubmission, { isLoading: isRejecting }] = useRejectSubmissionMutation();
  useEffect(() => {
    if (!token && user?.role !== "Admin") {
      router.push('/');
    }
  }, [user, router]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ 
    open: false, 
    message: '' 
  });

  const filteredSubmissions = useMemo(() => {
    const submissions = submissionsResponse || [];
    if (!searchQuery) return submissions;
    
    return submissions.filter(submission => 
      submission.channelUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (submission.submittedByEmail && submission.submittedByEmail.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [submissionsResponse, searchQuery]);
  const paginatedSubmissions = useMemo(() => {
    return filteredSubmissions.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredSubmissions, page, rowsPerPage]);

  const handleApprove = useCallback(async (submissionId: number) => {
    try {
      await approveSubmission(submissionId).unwrap();
      setSnackbar({ open: true, message: 'کانال با موفقیت تایید شد!' });
      setSelectedSubmissions(prev => prev.filter(id => id !== submissionId));
      refetch();
    } catch (err) {
      setSnackbar({ open: true, message: (err as any)?.data?.message || 'خطا در تایید درخواست.' });
    }
  }, [approveSubmission, refetch]);

  const handleReject = useCallback(async (submissionId: number) => {
    try {
      await rejectSubmission(submissionId).unwrap();
      setSnackbar({ open: true, message: 'درخواست رد شد.' });
      setSelectedSubmissions(prev => prev.filter(id => id !== submissionId));
      refetch();
    } catch (err) {
      setSnackbar({ open: true, message: (err as any)?.data?.message || 'خطا در رد درخواست.' });
    }
  }, [rejectSubmission, refetch]);

  const handleSelectAll = useCallback(() => {
    if (selectedSubmissions.length === paginatedSubmissions.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(paginatedSubmissions.map(sub => sub.id));
    }
  }, [selectedSubmissions, paginatedSubmissions]);

  const handleSelectSubmission = (id: number, isSelected: boolean) => {
    setSelectedSubmissions(prev => 
      isSelected 
        ? [...prev, id] 
        : prev.filter(subId => subId !== id)
    );
  };

  const handleBulkApprove = useCallback(async () => {
    const promises = selectedSubmissions.map(id => approveSubmission(id).unwrap());
    try {
      await Promise.all(promises);
      setSnackbar({ open: true, message: `${selectedSubmissions.length} کانال با موفقیت تایید شدند.` });
      setSelectedSubmissions([]);
      refetch();
    } catch (err) {
      setSnackbar({ open: true, message: (err as any)?.data?.message || 'یک یا چند مورد از تاییدها ناموفق بود.' });
    }
  }, [selectedSubmissions, approveSubmission, refetch]);

  const handleBulkReject = useCallback(async () => {
    const promises = selectedSubmissions.map(id => rejectSubmission(id).unwrap());
    try {
      await Promise.all(promises);
      setSnackbar({ open: true, message: `${selectedSubmissions.length} درخواست رد شدند.` });
      setSelectedSubmissions([]);
      refetch();
    } catch (err) {
      setSnackbar({ open: true, message: (err as any)?.data?.message || 'یک یا چند مورد از رد کردن‌ها ناموفق بود.' });
    }
  }, [selectedSubmissions, rejectSubmission, refetch]);

  if (isLoading && !submissionsResponse) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            در حال بارگذاری درخواست‌های در انتظار...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AdminPanelSettings sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              پنل مدیریت درخواست‌ها
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            بررسی، تایید یا رد کردن کانال‌های ارسال شده توسط کاربران
          </Typography>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs: 12, md: 6}}>
              <TextField
                fullWidth
                size="small"
                placeholder="جستجو در لینک‌ها یا ایمیل‌ها..."
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
            <Grid size={{xs: 12, md: 6}} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="بارگذاری مجدد لیست">
                <IconButton onClick={refetch} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
          
          {selectedSubmissions.length > 0 && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: alpha(theme.palette.primary.main, 0.08), 
              borderRadius: 2 
            }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                عملیات گروهی ({selectedSubmissions.length} مورد انتخاب شده):
              </Typography>
              <Box sx={{ display: ';flex', gap: 1, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<CheckCircle />} 
                  onClick={handleBulkApprove}
                  disabled={isApproving}
                >
                  تایید همه
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  startIcon={<Cancel />} 
                  onClick={handleBulkReject}
                  disabled={isRejecting}
                >
                  رد همه
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<SelectAll />} 
                  onClick={handleSelectAll}
                >
                  {paginatedSubmissions.length > 0 && selectedSubmissions.length === paginatedSubmissions.length 
                    ? 'لغو انتخاب همه' 
                    : 'انتخاب همه'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </motion.div>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          خطا در بارگذاری داده‌ها: {(error as any)?.data?.message || 'یک خطای ناشناخته رخ داد'}
        </Alert>
      )}

      {filteredSubmissions.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.background.paper, }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedSubmissions.length > 0 && 
                        selectedSubmissions.length < paginatedSubmissions.length
                      }
                      checked={
                        paginatedSubmissions.length > 0 && 
                        selectedSubmissions.length === paginatedSubmissions.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>لینک کانال</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ایمیل ارسال کننده</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>دسته‌بندی</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>تاریخ ارسال</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>وضعیت</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedSubmissions.map((submission) => (
                  <TableRow key={submission.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedSubmissions.includes(submission.id)}
                        onChange={(e) => handleSelectSubmission(submission.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <MuiLink 
                        component={NextLink}
                        href={submission.channelUrl} 
                        target="_blank" 
                        rel="noopener"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                          {submission.channelUrl}
                        </Typography>
                        <OpenInNew fontSize="small" sx={{ mr: 1 }} />
                      </MuiLink>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {submission.submittedByEmail || 'ثبت نشده'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={categories?.find(cat => cat.id === submission.categoryId)?.name || 'نامشخص'} 
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.light, 0.2), 
                          color: theme.palette.primary.dark 
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(submission.submittedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric'} )}
                      </Typography>
                      {submission.submittedAt && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          ({new Date(submission.submittedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric'} )}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="در انتظار تایید" 
                        size="small" 
                        sx={{ 
                          backgroundColor: alpha(theme.palette.warning.light, 0.2), 
                          color: theme.palette.warning.dark,
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="تایید درخواست">
                          <IconButton 
                            color="success" 
                            onClick={() => handleApprove(submission.id)}
                            disabled={isApproving}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="رد درخواست">
                          <IconButton 
                            color="error" 
                            onClick={() => handleReject(submission.id)}
                            disabled={isRejecting}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredSubmissions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="تعداد در هر صفحه:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
            sx={{ direction: 'ltr' }}
          />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              هیچ درخواستی یافت نشد
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery 
                ? 'لطفاً عبارت جستجوی دیگری را امتحان کنید.' 
                : 'در حال حاضر هیچ کانالی در انتظار تایید نیست.'}
            </Typography>
            <Button 
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refetch}
            >
              بارگذاری مجدد
            </Button>
          </Paper>
        </motion.div>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
}