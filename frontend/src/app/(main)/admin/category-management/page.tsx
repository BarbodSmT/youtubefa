'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  AdminPanelSettings,
  CheckCircle,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Category } from '@/types';
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from '@/store';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { ApiError } from 'next/dist/server/api-utils';

export default function AdminCategoryPage() {
  const theme = useTheme();
  const { 
    data: categoriesResponse, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  useEffect(() => {
    if (!token && user?.role !== "Admin") {
      router.push('/');
    }
  }, [user,token, router]);
  const filteredCategories = useMemo(() => {
    const categories = categoriesResponse || [];
    if (!searchQuery) return categories;
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categoriesResponse, searchQuery]);

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredCategories, page, rowsPerPage]);

  const handleOpenCreateDialog = () => {
    setCurrentCategory(null);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setCurrentCategory(category);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
    setFormErrors({});
  };

  const handleSelectAll = useCallback(() => {
    if (selectedCategories.length === paginatedCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(paginatedCategories.map(cat => cat.id));
    }
  }, [selectedCategories, paginatedCategories]);

  const handleSelectCategory = (id: number, isSelected: boolean) => {
    setSelectedCategories(prev => 
      isSelected 
        ? [...prev, id] 
        : prev.filter(catId => catId !== id)
    );
  };

  const handleDeleteCategory = useCallback(async (id: number) => {
    try {
      await deleteCategory(id).unwrap();
      setSnackbar({ open: true, message: 'دسته‌بندی با موفقیت حذف شد!' });
      setSelectedCategories(prev => prev.filter(catId => catId !== id));
    } catch (err) {
      setSnackbar({ open: true, message: 'خطا در حذف دسته‌بندی' });
    }
  }, [deleteCategory]);

  const handleBulkDelete = useCallback(async () => {
    const promises = selectedCategories.map(id => deleteCategory(id).unwrap());
    try {
      await Promise.all(promises);
      setSnackbar({ open: true, message: `${selectedCategories.length} دسته‌بندی با موفقیت حذف شدند.` });
      setSelectedCategories([]);
    } catch (err) {
      setSnackbar({ open: true, message: 'یک یا چند مورد از حذف‌ها ناموفق بود.' });
    }
  }, [selectedCategories, deleteCategory]);

  const handleSubmit = async (formData: Category) => {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'نام دسته‌بندی اجباری است';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (currentCategory) {
        await updateCategory({ ...formData, id: currentCategory.id }).unwrap();
        setSnackbar({ open: true, message: 'دسته‌بندی با موفقیت بروزرسانی شد!' });
      } else {
        await createCategory(formData).unwrap();
        setSnackbar({ open: true, message: 'دسته‌بندی جدید با موفقیت ایجاد شد!' });
      }
      handleCloseDialog();
      refetch();
    } catch (err) {
      const errorMessage = (err as any)?.data?.message || 'خطا در ذخیره تغییرات';
      setSnackbar({ open: true, message: errorMessage });
    }
  };

  if (isLoading && !categoriesResponse) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            در حال بارگذاری دسته‌بندی‌ها...
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
              مدیریت دسته‌بندی‌ها
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            ایجاد، ویرایش و حذف دسته‌بندی‌های کانال‌ها
          </Typography>
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{xs:12 , md:6}}>
              <TextField
                fullWidth
                size="small"
                placeholder="جستجو در دسته‌بندی‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                            <Search />
                            </InputAdornment>
                        ),
                    }
                }}
              />
            </Grid>
            <Grid size={{xs:12 , md:6}} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="بارگذاری مجدد لیست">
                <IconButton onClick={refetch} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={handleOpenCreateDialog}
              >
                ایجاد دسته‌بندی جدید
              </Button>
            </Grid>
          </Grid>
          
          {selectedCategories.length > 0 && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.error.main, 0.08), borderRadius: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                عملیات گروهی ({selectedCategories.length} مورد انتخاب شده):
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                  onClick={() => setSelectedCategories([])}
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
          خطا در بارگذاری داده‌ها: {(error as any)?.data?.message || 'یک خطای ناشناخته رخ داد'}
        </Alert>
      )}

      {filteredCategories.length > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selectedCategories.length > 0 && 
                        selectedCategories.length < paginatedCategories.length
                      }
                      checked={
                        paginatedCategories.length > 0 && 
                        selectedCategories.length === paginatedCategories.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>نام</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>آیکون</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>رنگ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">عملیات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => handleSelectCategory(category.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {category.icon && (
                        <Chip 
                          label={category.icon} 
                          sx={{fontSize: '1rem'}}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {category.color && (
                        <Box 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '4px', 
                            backgroundColor: category.color 
                          }} 
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="ویرایش">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(category)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteCategory(category.id)}
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
            count={filteredCategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="تعداد در هر صفحه:"
            labelDisplayedRows={({ from, to, count }) => (
              `${from}-${to} از ${count}`
            )}
          />
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              هیچ دسته‌بندی یافت نشد
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery 
                ? 'لطفاً عبارت جستجوی دیگری را امتحان کنید.' 
                : 'هنوز هیچ دسته‌بندی ایجاد نشده است.'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleOpenCreateDialog}
            >
              ایجاد اولین دسته‌بندی
            </Button>
          </Paper>
        </motion.div>
      )}

      {/* Category Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          {currentCategory ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <CategoryForm 
            category={currentCategory} 
            onSubmit={handleSubmit}
            errors={formErrors}
            isSubmitting={isCreating || isUpdating}
          />
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

function CategoryForm({ 
  category, 
  onSubmit, 
  errors, 
  isSubmitting 
}: { 
  category: Category | null;
  onSubmit: (data: Category) => void;
  errors: { name?: string };
  isSubmitting: boolean;
}) {
  const [id, setId] = useState(category?.id || 0);
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '');
  const [color, setColor] = useState(category?.color || '');
  var theme = useTheme();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id, name, icon, color });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{xs:12}}>
          <FormControl fullWidth error={!!errors.name}>
            <TextField
              fullWidth
              label="نام دسته‌بندی"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              required
            />
            {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
          </FormControl>
        </Grid>
        
        <Grid size={{xs:12 , md:6}}>
          <TextField
            fullWidth
            label="آیکون (نام Material Icon)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            helperText="مثال: category"
          />
        </Grid>
        
        <Grid size={{xs:12 , md:6}}>
          <TextField
            fullWidth
            label="رنگ (کد HEX)"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            slotProps={{
                input: {
                    startAdornment: (
                        <InputAdornment position="start">
                            <Box 
                                sx={{ 
                                    width: 20, 
                                    height: 20, 
                                    borderRadius: '4px', 
                                    backgroundColor: color || 'transparent',
                                    border: color ? 'none' : `1px solid ${theme.palette.divider}`
                                }} 
                            />
                        </InputAdornment>
                    ),
                }
            }}
            helperText="مثال: #4CAF50"
          />
        </Grid>
      </Grid>
      
      <DialogActions sx={{ mt: 3, px: 0 }}>
        <Button 
          variant="outlined" 
          onClick={() => onSubmit({ id: 0,name: '', icon: '', color: '' })}
          disabled={isSubmitting}
        >
          لغو
        </Button>
        <Button 
          type="submit"
          variant="contained" 
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckCircle />}
          disabled={isSubmitting}
        >
          {category ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
        </Button>
      </DialogActions>
    </Box>
  );
}