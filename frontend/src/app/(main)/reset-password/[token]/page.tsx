'use client';
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { useForm } from 'react-hook-form';
import type {SubmitHandler} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useResetPasswordMutation } from "@/store";

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ حرف باشد'),
  confirmPassword: z.string(),
}).superRefine(({ confirmPassword, password }, ctx) => {
  if (confirmPassword !== password) {
    ctx.addIssue({
      code: "custom",
      message: "رمزهای عبور با هم تطابق ندارند",
      path: ['confirmPassword'],
    });
  }
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const theme = useTheme();
  const router = useRouter();
  const { token } = params;
  const [resetPassword, { isLoading, isSuccess, error }] = useResetPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema)
  });
  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (!token) {
      console.error("لینک بازیابی نامعتبر است.");
      return;
    }

    try {
      await resetPassword({ password: data.password, token }).unwrap();
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      console.error("بازیابی رمز عبور با خطا مواجه شد:", err);
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
              تنظیم رمز عبور جدید
            </Typography>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ width: '100%' }}>
            {isSuccess ? (
              <Box sx={{ textAlign: 'center', my: 4 }}>
                <Alert severity="success" sx={{ backgroundColor: theme.palette.background.default,color: theme.palette.text.primary,my: 2,width: '100%' }}>
                  رمز عبور شما با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...
                </Alert>
                <Button component={NextLink} href="/login" variant="contained" sx={{ mt: 2 }}>
                  رفتن به صفحه ورود
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="رمز عبور جدید"
                  type="password"
                  id="password"
                  autoFocus
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="تکرار رمز عبور جدید"
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  color="secondary"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'تغییر رمز عبور'}
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
              </Box>
            )}
          </motion.div>
        </Box>
      </Paper>
    </Container>
  );
}