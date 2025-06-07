import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
} from '@mui/material';
import { LoginRequest } from '../types/auth';

interface LoginFormProps {
  onGetUserId: (credentials: LoginRequest) => Promise<void>;
  loading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onGetUserId, loading }) => {
  const [error, setError] = React.useState<string>('');

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .email('Invalid email address')
        .required('Please enter the email of the account to delete'),
      password: Yup.string()
        .required('Please enter the password'),
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        await onGetUserId(values);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Delete Account
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <TextField
            fullWidth
            margin="normal"
            id="username"
            name="username"
            label="Email of the account to delete"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            fullWidth
            margin="normal"
            id="password"
            name="password"
            label="Password of the account to delete"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={formik.isSubmitting || loading}
          >
            {loading ? 'Processing...' : 'Continue'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginForm; 