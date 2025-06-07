import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Paper, Typography, Divider, Avatar, Alert, Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Security';
import { authService } from './services/authService';
import { userService } from './services/userService';
import { User, LoginRequest, EntityId } from './types/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [step, setStep] = useState(1); // 1: nhập email/pass, 2: nhập lý do xoá
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null); // admin
  const [targetUserId, setTargetUserId] = useState<EntityId | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // form state
  const [loginValues, setLoginValues] = useState({ username: '', password: '' });
  const [loginTouched, setLoginTouched] = useState({ username: false, password: false });
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  React.useEffect(() => {
    authService.logout();
  }, []);

  // Validate login form
  const loginErrors = {
    username: !loginValues.username ? 'Vui lòng nhập email tài khoản cần xóa' :
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(loginValues.username) ? 'Email không hợp lệ' : '',
    password: !loginValues.password ? 'Vui lòng nhập mật khẩu' : '',
  };

  // Validate reason
  const reasonError = !reason ? 'Vui lòng nhập lý do xóa tài khoản' : reason.length < 10 ? 'Lý do phải có ít nhất 10 ký tự' : '';

  // Xử lý bước 1: lấy userId
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginTouched({ username: true, password: true });
    setError('');
    if (loginErrors.username || loginErrors.password) return;
    setLoading(true);
    try {
      await authService.login({ username: loginValues.username, password: loginValues.password });
      const user = await authService.getCurrentUser();
      if (!user?.id?.id) throw new Error('Không lấy được userId');
      setTargetUserId(user.id);
      await authService.logout();
      await authService.loginAdmin();
      const adminUser = await authService.getCurrentUser();
      setCurrentUser(adminUser);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lấy userId hoặc đăng nhập admin');
      setTargetUserId(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý bước 2: gửi yêu cầu xóa
  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReasonTouched(true);
    setError('');
    if (reasonError) return;
    setOpenConfirm(true);
  };

  // Thực hiện xóa sau khi xác nhận dialog
  const handleConfirmDelete = async () => {
    setOpenConfirm(false);
    setIsDeleting(true);
    setError('');
    try {
      await userService.deleteUser({ userId: targetUserId?.id || '', reason });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại sau.');
      setSuccess(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quay lại bước đầu
  const handleReset = () => {
    setCurrentUser(null);
    setTargetUserId(null);
    setError('');
    setLoading(false);
    setStep(1);
    setLoginValues({ username: '', password: '' });
    setLoginTouched({ username: false, password: false });
    setReason('');
    setReasonTouched(false);
    setSuccess(false);
    authService.logout();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 100%)' }}>
        <Paper elevation={6} sx={{ p: 5, mt: 6, borderRadius: 5, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', backdropFilter: 'blur(8px)', border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar src="/assets/images/MIMLogo.png" sx={{ width: 72, height: 72, mb: 1, boxShadow: 3 }} />
            <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 900, letterSpacing: 2, color: '#0097a7', textShadow: '0 2px 8px #b2ebf2' }}>
              MIM
            </Typography>
            {/* <Typography variant="h5" align="center" sx={{ color: '#37474f', fontWeight: 700, mb: 1 }}>
              Major Incident Management
            </Typography> */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ShieldIcon sx={{ color: '#0097a7', fontSize: 28 }} />
              <Typography variant="h5" sx={{ color: '#0097a7', fontWeight: 600 }}>
                ThingsBoard Account Deletion
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ background: '#e0f2f1', borderRadius: 3, p: 2, mb: 3, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00796b', fontWeight: 700 }}>
              Account Deletion Steps
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: '#37474f' }}>
              <b>Step 1:</b> Enter your account email and password<br/>
              <b>Step 2:</b> Click Continue<br/>
              <b>Step 3:</b> Enter the reason for account deletion<br/>
              <b>Step 4:</b> Click Delete Account
            </Typography>
          </Box>
          <Box sx={{ background: '#fffde7', borderRadius: 3, p: 2, mb: 3, boxShadow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#fbc02d', fontWeight: 700 }}>
              Account Deletion Policy
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ color: '#795548' }}>
              - <b>Data Security:</b> All your personal information will be kept strictly confidential and only used for verifying your account deletion request.<br/>
              - <b>Irrecoverable:</b> Once your account is deleted, you will not be able to access or recover any data related to this account.<br/>
              - <b>Support:</b> If you have any questions about the deletion process, please contact us using the information below.
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Your account has been successfully deleted!
            </Alert>
          )}
          {/* Step forms */}
          {step === 1 && (
            <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{ mt: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                id="username"
                name="username"
                label="Account email to delete"
                value={loginValues.username}
                onChange={e => setLoginValues(v => ({ ...v, username: e.target.value }))}
                onBlur={() => setLoginTouched(t => ({ ...t, username: true }))}
                error={loginTouched.username && Boolean(loginErrors.username)}
                helperText={loginTouched.username && loginErrors.username}
                autoComplete="username"
                sx={{ background: '#fafafa', borderRadius: 2 }}
              />
              <TextField
                fullWidth
                margin="normal"
                id="password"
                name="password"
                label="Account password to delete"
                type="password"
                value={loginValues.password}
                onChange={e => setLoginValues(v => ({ ...v, password: e.target.value }))}
                onBlur={() => setLoginTouched(t => ({ ...t, password: true }))}
                error={loginTouched.password && Boolean(loginErrors.password)}
                helperText={loginTouched.password && loginErrors.password}
                autoComplete="current-password"
                sx={{ background: '#fafafa', borderRadius: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, fontWeight: 700, fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2, textTransform: 'none' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue'}
              </Button>
            </Box>
          )}
          {step === 2 && (
            <Box component="form" onSubmit={handleDeleteSubmit} noValidate sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                id="reason"
                name="reason"
                label="Reason for account deletion"
                value={reason}
                onChange={e => setReason(e.target.value)}
                onBlur={() => setReasonTouched(true)}
                error={reasonTouched && Boolean(reasonError)}
                helperText={reasonTouched && reasonError}
                sx={{ background: '#fafafa', borderRadius: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="error"
                sx={{ mt: 3, fontWeight: 700, fontSize: 18, py: 1.5, borderRadius: 3, boxShadow: 2, textTransform: 'none' }}
                disabled={isDeleting}
              >
                {isDeleting ? 'Processing...' : 'Delete Account'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                sx={{ mt: 2, fontWeight: 600, borderRadius: 3, textTransform: 'none' }}
                onClick={handleReset}
                disabled={isDeleting}
              >
                Back
              </Button>
              <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to delete this account? This action cannot be undone and all related data will be permanently deleted.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenConfirm(false)} color="primary">Cancel</Button>
                  <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>Delete Account</Button>
                </DialogActions>
              </Dialog>
            </Box>
          )}
          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#607d8b', fontWeight: 700, mb: 0.5 }}>
              Contact Information
            </Typography>
            <Typography variant="body2" sx={{ color: '#37474f' }}>
              <b>Full name:</b> Vũ Văn Thành<br/>
              <b>Email:</b> thanhvv1@salasoft.vn<br/>
              <b>Phone:</b> +84 879737885
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
