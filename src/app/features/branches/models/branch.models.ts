export interface BranchResponse {
  id: string; // O string (Guid) según tu backend
  name: string;
  address: string | null;
}

export interface CreateBranchRequest {
  name: string;
  address: string | null;
}

export interface UpdateBranchRequest {
  name: string;
  address: string | null;
}
