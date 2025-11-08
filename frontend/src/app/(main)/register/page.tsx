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
import Logo from '../../../components/Logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import type { RootState } from '../../../store';
import {useRegisterMutation} from '../../../store'
import { useSelector } from 'react-redux';
import type { SubmitHandler } from 'react-hook-form';
import NextLink from 'next/link';
const registerSchema = z.object({
  name: z.string().min(3, 'نام و نام خانوادگی باید حداقل ۳ حرف باشد'),
  email: z.string().email('آدرس ایمیل وارد شده معتبر نیست'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ حرف باشد'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'شما باید با شرایط و قوانین موافقت کنید',
  }),
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "رمزهای عبور با هم تطابق ندارند",
      path: ['confirmPassword'],
    });
    ctx.addIssue({
      code: "custom",
      message: "رمزهای عبور با هم تطابق ندارند",
      path: ['password'],
    });
  }
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const theme = useTheme();
  const router = useRouter();

  const [registerUser, { isLoading, isSuccess, error }] = useRegisterMutation();

  const { token } = useSelector((state: RootState) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    }
  });

  useEffect(() => {
    if (token) {
      router.push('/');
    }
  }, [token, router]);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password }).unwrap();
    } catch (err) {
      console.error("ثبت‌نام با خطا مواجه شد:", err);
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
              ایجاد حساب کاربری
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ width: '100%' }}
          >
            {isSuccess ? (
                <Alert severity="success" sx={{ backgroundColor: theme.palette.background.default,color: theme.palette.text.primary,my: 2, width: '100%' }}>
                    ثبت نام شما با موفقیت انجام شد. الان می توانید به حساب خود وارد شوید.
                </Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="نام و نام خانوادگی"
                  autoComplete="name"
                  autoFocus
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="آدرس ایمیل"
                  autoComplete="email"
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
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="تکرار رمز عبور"
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
                <FormControlLabel
                  control={<Checkbox color="primary" {...register('agreeToTerms')} />}
                  label={
                    <Typography variant="body2">
                      با شرایط استفاده و حریم خصوصی موافقم.
                    </Typography>
                  }
                />
                {errors.agreeToTerms && <Typography display="block" variant="caption" color="error">{errors.agreeToTerms.message}</Typography>}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  color="secondary"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ثبت نام'}
                </Button>
                {error && <Alert severity="error" sx={{ backgroundColor: theme.palette.background.default,color: theme.palette.text.primary,my: 2, width: '100%' }}>
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
                </Alert>}
              </Box>
            )}
            <Grid container justifyContent="flex-start" sx={{ mt: 2 }}>
              <Grid>
                <MuiLink component={NextLink} href="/login" variant="body2" underline="hover">
                  حساب کاربری دارید؟ وارد شوید
                </MuiLink>
              </Grid>
            </Grid>
          </motion.div>
        </Box>
      </Paper>
    </Container>
  );
}