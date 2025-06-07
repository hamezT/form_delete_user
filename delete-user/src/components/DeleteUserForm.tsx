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
import { userService } from '../services/userService';
import { EntityId } from '../types/auth';

interface DeleteUserFormProps {
  userId: EntityId;
  onReset: () => void;
}

const DeleteUserForm: React.FC<DeleteUserFormProps> = ({ userId, onReset }) => {
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<boolean>(false);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    console.log('DeleteUserForm mounted with userId:', userId);
  }, [userId]);

  const formik = useFormik({
    initialValues: {
      reason: '',
    },
    validationSchema: Yup.object({
      reason: Yup.string()
        .required('Vui lòng nhập lý do xóa tài khoản')
        .min(10, 'Lý do phải có ít nhất 10 ký tự'),
    }),
    onSubmit: async (values) => {
      try {
        setIsDeleting(true);
        setError('');

        // Lấy userId từ object
        const userIdString = userId.id;
        console.log('Submitting delete request with userId:', userIdString);

        // Gọi API xóa user
        await userService.deleteUser({
          userId: userIdString,
          reason: values.reason,
        });

        setSuccess(true);
      } catch (err: any) {
        console.error('Delete user error:', err);
        setError(err.message || 'Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại sau.');
        setSuccess(false);
      } finally {
        setIsDeleting(false);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Yêu Cầu Xóa Tài Khoản
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Yêu cầu xóa tài khoản đã được gửi thành công!
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            id="reason"
            name="reason"
            label="Lý do xóa tài khoản"
            value={formik.values.reason}
            onChange={formik.handleChange}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="error"
            sx={{ mt: 3 }}
            disabled={formik.isSubmitting || isDeleting}
          >
            {isDeleting ? 'Đang Xử Lý...' : 'Gửi Yêu Cầu Xóa Tài Khoản'}
          </Button>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          sx={{ mt: 2 }}
          onClick={onReset}
          disabled={isDeleting}
        >
          Quay lại
        </Button>
      </Paper>
    </Container>
  );
};

export default DeleteUserForm; 