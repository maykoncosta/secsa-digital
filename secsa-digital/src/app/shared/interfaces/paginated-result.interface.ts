export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lastDoc?: any; // Cursor para próxima página
  firstDoc?: any; // Cursor para página anterior
}
