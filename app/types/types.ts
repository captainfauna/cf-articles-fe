export interface ApiMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number
}

export interface PaginationParam {
  page: number;
  page_size: number;
}