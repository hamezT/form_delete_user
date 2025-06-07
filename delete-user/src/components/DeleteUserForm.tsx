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
  Divider,
  Avatar,
} from '@mui/material';
import { userService } from '../services/userService';
import { EntityId } from '../types/auth';
import ShieldIcon from '@mui/icons-material/Security';

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
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)' }}>
      <Paper elevation={6} sx={{ p: 5, mt: 6, borderRadius: 5, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', backdropFilter: 'blur(8px)', border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar src="/assets/images/MIMLogo.png" sx={{ width: 72, height: 72, mb: 1, boxShadow: 3 }} />
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 900, letterSpacing: 2, color: '#0097a7', textShadow: '0 2px 8px #b2ebf2' }}>
            MIM
          </Typography>
          <Typography variant="h5" align="center" sx={{ color: '#37474f', fontWeight: 700, mb: 1 }}>
            Major Incident Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ShieldIcon sx={{ color: '#0097a7', fontSize: 28 }} />
            <Typography variant="subtitle1" sx={{ color: '#0097a7', fontWeight: 600 }}>
              Xóa Tài Khoản ThingsBoard
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ background: '#e0f2f1', borderRadius: 3, p: 2, mb: 3, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#00796b', fontWeight: 700 }}>
            Các Bước Xóa Tài Khoản
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#37474f' }}>
            1. <b>Điền lý do xóa tài khoản</b> để chúng tôi phục vụ bạn tốt hơn.<br/>
            2. <b>Xác Nhận Yêu Cầu:</b> Hệ thống sẽ gửi email xác nhận tới địa chỉ email bạn đã đăng ký.<br/>
            3. <b>Xử Lý Yêu Cầu:</b> Đội ngũ hỗ trợ sẽ kiểm tra và xác thực thông tin. Quá trình này có thể mất từ 1-3 ngày làm việc.<br/>
            4. <b>Xóa Tài Khoản:</b> Sau khi xác thực thành công, tài khoản của bạn sẽ được xóa vĩnh viễn khỏi hệ thống ThingsBoard. Mọi dữ liệu liên quan sẽ không thể khôi phục.
          </Typography>
        </Box>
        <Box sx={{ background: '#fffde7', borderRadius: 3, p: 2, mb: 3, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#fbc02d', fontWeight: 700 }}>
            Quy Trình Xóa Tài Khoản
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#795548' }}>
            - <b>Bảo mật thông tin:</b> Mọi thông tin cá nhân của bạn sẽ được bảo mật tuyệt đối và chỉ sử dụng cho mục đích xác thực yêu cầu xóa tài khoản.<br/>
            - <b>Không thể khôi phục:</b> Sau khi tài khoản bị xóa, bạn sẽ không thể truy cập hoặc khôi phục bất kỳ dữ liệu nào liên quan đến tài khoản này.<br/>
            - <b>Hỗ trợ:</b> Nếu có bất kỳ thắc mắc nào về quy trình xóa tài khoản, vui lòng liên hệ với chúng tôi qua thông tin bên dưới.
          </Typography>
        </Box>
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
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 2 }}>
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
            sx={{ background: '#fafafa', borderRadius: 2 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="error"
            sx={{ mt: 3, fontWeight: 700, fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2, textTransform: 'none' }}
            disabled={formik.isSubmitting || isDeleting}
          >
            {isDeleting ? 'Đang Xử Lý...' : 'Gửi Yêu Cầu Xóa Tài Khoản'}
          </Button>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          sx={{ mt: 2, fontWeight: 600, borderRadius: 3, textTransform: 'none' }}
          onClick={onReset}
          disabled={isDeleting}
        >
          Quay lại
        </Button>
        <Divider sx={{ my: 4 }} />
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#607d8b', fontWeight: 700, mb: 0.5 }}>
            Thông Tin Liên Hệ (Công ty chịu trách nhiệm xóa tài khoản)
          </Typography>
          <Typography variant="body2" sx={{ color: '#37474f' }}>
            <b>Họ và tên:</b> Nguyễn Văn Thanh<br/>
            <b>Email:</b> support@mim.com<br/>
            <b>Số điện thoại:</b> 0123 456 789
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default DeleteUserForm; 