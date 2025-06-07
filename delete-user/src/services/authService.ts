import axios from 'axios';
import { LoginRequest, LoginResponse, User } from '../types/auth';

const API_URL = 'https://platform.mim-corp.com/api';

// Tạo instance axios với interceptor để tự động thêm token
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['X-Authorization'] = `Bearer ${token}`;
  }
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    data: config.data
  });
  return config;
});

// Thêm interceptor để xử lý response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      authService.logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      const { token, refreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.';
        console.error('Login error:', error.response.data);
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('Network error:', error.request);
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error('Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    }
  },

  // Thêm hàm loginAdmin
  loginAdmin: async (): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', {
        username: 'thanhvv1@salasoft.vn', // Thay thế bằng tài khoản admin thực tế
        password: '125250aA' // Thay thế bằng mật khẩu admin thực tế
      });
      
      const { token, refreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Đăng nhập admin thất bại.';
        console.error('Admin login error:', error.response.data);
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      console.log('Getting current user...');
      const response = await api.get('/auth/user');
      console.log('Get current user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Logging out with token:', token ? 'Token exists' : 'No token');
      
      if (token) {
        // Gọi API logout
        console.log('Calling logout API...');
        await api.post('/auth/logout', '', {
          headers: {
            'X-Authorization': `Bearer ${token}`
          }
        });
        console.log('Logout API call successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa token khỏi localStorage
      console.log('Removing tokens from localStorage');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      console.log('Tokens removed from localStorage');
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Hàm mới: Login nhanh để lấy userId rồi logout ngay
  quickLoginForUserId: async (credentials: LoginRequest): Promise<string> => {
    try {
      console.log('Starting quick login process...');
      
      // Login để lấy token
      console.log('Logging in to get token...');
      await authService.login(credentials);
      console.log('Login successful, got token');
      
      // Lấy thông tin user
      console.log('Getting user info...');
      const user = await authService.getCurrentUser();
      console.log('Got user info:', user);
      
      // Logout ngay lập tức
      console.log('Logging out immediately...');
      await authService.logout();
      console.log('Logout completed');
      
      // Trả về userId
      console.log('Returning userId:', user.id.id);
      return user.id.id;
    } catch (error) {
      console.error('Quick login error:', error);
      throw error;
    }
  }
}; 