export type TransactionQueryParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  doctorName?: string;
  status?: string;
  method?: string;
  type?: string;
}

export type WalletTransactionQuery = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  description?: string;
}

export type NotificationQueryParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  type?: string;
  date?: string
}

export interface QueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  consultationType?: string;
  paymentStatus?: string;
}

export type UserQueryParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isVerfied?: string;
  isActive?: string;
  isApproved?: string;
  name?: string;
  email?: string;
  status?: string
}

export type DoctorQueryParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  isVerified?: string;
  isActive?: string;
  isApproved?: string;
  name?: string;
  email?: string;
  status?: string
}