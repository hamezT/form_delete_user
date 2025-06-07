import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginForm from './components/LoginForm';
import DeleteUserForm from './components/DeleteUserForm';
import { authService } from './services/authService';
import { User, LoginRequest, EntityId } from './types/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null); // admin
  const [targetUserId, setTargetUserId] = useState<EntityId | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Khi app khởi động, xóa token cũ
  React.useEffect(() => {
    authService.logout();
  }, []);

  // Hàm lấy userId từ thông tin đăng nhập user, sau đó đăng nhập admin
  const handleGetUserId = async (credentials: LoginRequest) => {
    setLoading(true);
    setError('');
    try {
      // 1. Đăng nhập bằng tài khoản user cần xóa
      await authService.login(credentials);
      // 2. Lấy userId qua getCurrentUser
      const user = await authService.getCurrentUser();
      if (!user?.id?.id) throw new Error('Không lấy được userId');
      setTargetUserId(user.id);
      // 3. Logout user
      await authService.logout();
      // 4. Đăng nhập lại bằng admin
      await authService.loginAdmin();
      const adminUser = await authService.getCurrentUser();
      setCurrentUser(adminUser);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lấy userId hoặc đăng nhập admin');
      setTargetUserId(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Hàm reset để quay lại bước nhập thông tin user
  const handleReset = () => {
    setCurrentUser(null);
    setTargetUserId(null);
    setError('');
    setLoading(false);
    authService.logout();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!targetUserId || !currentUser ? (
        <LoginForm onGetUserId={handleGetUserId} loading={loading} />
      ) : (
        <DeleteUserForm userId={targetUserId} onReset={handleReset} />
      )}
      {error && (
        <div style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>{error}</div>
      )}
    </ThemeProvider>
  );
}

export default App;
