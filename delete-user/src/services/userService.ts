import { DeleteUserRequest } from '../types/user';
import axios from 'axios';
import { AxiosError } from 'axios';

export class UserServiceError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errorCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

const API_URL = 'https://platform.mim-corp.com/api';

export const userService = {
  deleteUser: async (request: DeleteUserRequest) => {
    try {
      // Đảm bảo userId là string và không phải object
      if (!request.userId) {
        throw new UserServiceError('User ID is required');
      }

      const userId = String(request.userId).trim();
      console.log('Deleting user with ID:', userId);
      console.log('Delete request data:', { userId, reason: request.reason });
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new UserServiceError('Không tìm thấy token xác thực');
      }

      // Gọi API với token xác thực
      const response = await axios.delete(`${API_URL}/user/${userId}`, {
        data: { reason: request.reason },
        headers: {
          'X-Authorization': `Bearer ${token}`
        }
      });
      console.log('Delete user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data);
        throw new UserServiceError(
          error.response.data.message || 'Có lỗi xảy ra khi xóa tài khoản',
          error.response.status,
          error.response.data.errorCode,
          error.response.data
        );
      }
      throw error;
    }
  }
}; 