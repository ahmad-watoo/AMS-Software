export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  profilePictureUrl?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

