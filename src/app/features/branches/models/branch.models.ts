export interface BranchResponse {
  id: string; // O string (Guid) según tu backend
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
}

export interface CreateBranchRequest {
  code: string;
  name: string;
  address: string | null;
}

export interface UpdateBranchRequest {
  code: string;
  name: string;
  address: string | null;
}
