export interface RoleResponse {
  id: string;
  name: string;
}

export interface RoleDetailResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateRoleRequest {
  name: string;
  description: string | null;
}

export interface UpdateRoleRequest {
  name: string;
  description: string | null;
}

export interface AssignRolePermissionsRequest {
  PermissionIds: string[];
}
