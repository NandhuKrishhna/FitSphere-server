export interface AppointmentQueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  consultationType?: string;
  paymentStatus?: string;
}

export interface PaginatedAppointments {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
