'use client';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Grid,
  useTheme,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForgotPasswordMutation } from "@/store";
import type { SubmitHandler } from "react-hook-form";
import NextLink from 'next/link'
const forgotPasswordSchema = z.object({
  email: z.string().email('آدرس ایمیل وارد شده معتبر نیست.'),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const theme = useTheme();

  const [forgotPassword, { isLoading, isSuccess, error }] = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
    } catch (err) {
      console.error("درخواست بازیابی رمز عبور با خطا مواجه شد:", err);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{mt: 8}}>
      <Paper
        sx={{
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 8 },
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <Logo size="large" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Typography component="h1" variant="h5" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
              بازیابی رمز عبور
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{width: '100%'}}
          >
            {isSuccess ? (
              <Alert severity="success" sx={{ my: 4, width: '100%' }}>
                اگر ایمیل شما در سیستم ما ثبت شده باشد، لینکی برای بازیابی رمز عبور برایتان ارسال خواهد شد.
              </Alert>
            ) : (
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  color="secondary"
                  sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'ارسال لینک بازیابی'}
                </Button>
                {error &&
                  <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
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
                }
              </Box>
            )}
            <Grid container justifyContent="center">
              <Grid>
                <MuiLink
                  component={NextLink}
                  href="/login"
                  variant="body2"
                  underline="hover"
                >
                  بازگشت به صفحه ورود
                </MuiLink>
              </Grid>
            </Grid>
          </motion.div>
        </Box>
      </Paper>
    </Container>
  );
}