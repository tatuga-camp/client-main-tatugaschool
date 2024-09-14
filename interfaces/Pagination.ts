export interface Pagination<T> {
  data: T[];
  total: number;
  lastPage: number;
  currentPage: number;
  prev: number;
  next: number;
}
