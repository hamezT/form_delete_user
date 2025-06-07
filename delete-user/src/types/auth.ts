export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
}

export interface EntityId {
  entityType: string;
  id: string;
}

export interface User {
  id: EntityId;
  email: string;
  firstName: string | null;
  lastName: string | null;
  authority: string;
  tenantId: EntityId;
  customerId: EntityId;
  createdTime: number;
  name: string;
  phone: string | null;
  additionalInfo: {
    description: string;
    defaultDashboardId: string | null;
    defaultDashboardFullscreen: boolean;
    homeDashboardId: string | null;
    homeDashboardHideToolbar: boolean;
  };
  ownerId: EntityId;
  version: number;
} 