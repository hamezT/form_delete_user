export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface DeleteUserRequest {
  userId: string;
  reason: string;
} 