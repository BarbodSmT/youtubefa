'use client';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  useTheme,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { YouTube, Link as LinkIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import type {RootState } from '../../../store';
import { useGetCategoriesQuery, useAddSubmissionMutation } from '../../../store';

const normalizeYouTubeUrl = (input: string): string => {
  const trimmedInput = input.trim();
  if (trimmedInput.startsWith('@')) {
    return `https://www.youtube.com/${trimmedInput}`;
  }
  return trimmedInput;
};

export default function SubmitChannelPage() {
  const theme = useTheme();
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [channelUrl, setChannelUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [createSubmission, {
    isLoading: loading,
    isSuccess: submissionSuccess,
    error: error
  }] = useAddSubmissionMutation();
  const {
    data: categories,
    isLoading: categoriesLoading
  } = useGetCategoriesQuery();

  if (!token && !user) {
    return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, pb: 4 }}>
      <Grid container justifyContent="center">
        <Grid size={{xs: 12, md: 8}} sx={{display: 'flex', justifyContent: 'center'}}>
    <Alert severity="error" sx={{ mt: 8, fontSize: '1.2rem' }}>
      برای ثبت کانال باید وارد شوید
    </Alert>
    </Grid></Grid></Container>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!channelUrl || !categoryId) {
      setFormError('لطفا تمام فیلدهای فرم را پر کنید.');
      return;
    }

   const normalizedUrl = normalizeYouTubeUrl(channelUrl);
    try {
      await createSubmission({ 
        channelUrl: normalizedUrl, 
        categoryId: Number(categoryId), 
        submittedByEmail: user?.email, 
      }).unwrap();
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
    console.error("Submission failed:", err);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 8, pb: 4 }}>
      <Grid container justifyContent="center">
        <Grid size={{xs: 12, md: 8}}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              sx={{
                p: { xs: 2, sm: 4 },
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <YouTube sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
                <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                  ثبت کانال جدید
                </Typography>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                لینک کانال یوتیوب یا هندل (مثال: @username) را به همراه دسته‌بندی آن برای بررسی و اضافه شدن به کتابخانه ثبت کنید.
              </Typography>

              {submissionSuccess ? (
                <Alert severity="success" sx={{ mt: 4 }}>
                  کانال شما با موفقیت برای بررسی ثبت شد. به زودی به صفحه اصلی منتقل می‌شوید.
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  {/* YouTube URL Field */}
                  <TextField
                    fullWidth
                    required
                    label="لینک یا هندل کانال یوتیوب"
                    placeholder="https://www.youtube.com/@username or @username"
                    value={channelUrl}
                    onChange={(e) => setChannelUrl(e.target.value)}
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    sx={{ mb: 3 }}
                  />

                  {/* Category Field */}
                  <FormControl fullWidth required sx={{ mb: 4 }}>
                    <InputLabel id="category-select-label">دسته‌بندی</InputLabel>
                    <Select
                      labelId="category-select-label"
                      value={categoryId}
                      label="دسته‌بندی"
                      onChange={(e) => setCategoryId(e.target.value)}
                      disabled={categoriesLoading}
                    >
                      {/* Map over the categories from the Redux store */}
                      {categories?.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{cat.icon}</span>
                            {cat.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Form-specific error */}
                  {formError && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      {formError}
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || categoriesLoading}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    {loading || categoriesLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'ارسال برای بررسی'
                    )}
                  </Button>

                  {/* API error from RTK Query */}
                  {error && (
                    <Alert severity="error" sx={{ mt: 3, width: '100%' }}>
                    {(() => {
                      if ('data' in error) {
                        const errorData = error.data as { message?: string };
                        return errorData.message || 'خطای ناشناخته.';
                      }
                      if ('message' in error) {
                        return error.message;
                      }
                      return 'خطای ناشناخته.';
                    })()}
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}

