export interface UserResponse {
  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  email: string | null;
  roleName: string;
  isActive: boolean;
}

export interface UserDetailResponse {
  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  phoneNumber: string | null;
  email: string | null;
  roleId: string;
  isActive: boolean;
  branchIds: string[];
}

export interface CreateUserRequest {
  name: string;
  userName: string;
  password: string;
  ProfilePicture: string | null;
  email: string | null;
  phoneNumber: string | null;
  roleId: string;
}

export interface UpdateUserRequest {
  name: string;
  userName: string;
  ProfilePicture: string | null;
  email: string | null;
  phoneNumber: string | null;
  roleId: string;
}
