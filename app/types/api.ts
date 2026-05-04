export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T | { items: T; meta: PaginationMeta }
}
