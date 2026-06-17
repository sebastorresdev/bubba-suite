export interface UserResponse {
  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  email: string | null;
  roleName: string;
  status: UserStatus;
}

export interface UserDetailResponse {
  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  phoneNumber: string | null;
  email: string | null;
  roleId: string;
  status: UserStatus;
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

export enum UserStatus {
    Active = 0,
    Inactive = 1,
}
