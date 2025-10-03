'use client';
import { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Grid,
  useTheme,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import type { RootState, AppDispatch } from '@/store';
import { useLoginMutation } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import NextLink from 'next/link'

const loginSchema = z.object({
  email: z.email('آدرس ایمیل وارد شده معتبر نیست.'),
  password: z.string().min(1, 'وارد کردن رمز عبور اجباری است.'),
  rememberMe: z.boolean(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const theme = useTheme();
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  const { token } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login({ email: data.email, password: data.password, rememberMe: data.rememberMe }).unwrap();
    } catch (err) {
      console.error("ورود با خطا مواجه شد:", err);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        sx={{
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 8 },
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Logo size="large" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Typography component="h1" variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
              ورود به حساب کاربری
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ width: '100%' }}
          >
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="آدرس ایمیل"
                autoComplete="email"
                autoFocus
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="رمز عبور"
                type="password"
                id="password"
                autoComplete="current-password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <FormControlLabel
                control={<Checkbox color="primary" {...register('rememberMe')} />}
                label="مرا به خاطر بسپار"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ورود'}
              </Button>
              {error && (
                <Alert severity="error" sx={{ backgroundColor: theme.palette.background.default,color: theme.palette.text.primary,my: 2, width: '100%' }}>
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
              <Grid container justifyContent="space-between">
                <Grid>
                  <MuiLink component={NextLink} href="/forgot-password" variant="body2" underline="hover">
                    رمز عبور خود را فراموش کرده‌اید؟
                  </MuiLink>
                </Grid>
                <Grid>
                  <MuiLink component={NextLink} href="/register" variant="body2" underline="hover">
                    حساب کاربری ندارید؟ ثبت نام کنید
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Box>
      </Paper>
    </Container>
  );
}