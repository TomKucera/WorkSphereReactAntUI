export interface ListState<TFilter, TSort> {
    filters: TFilter;
    sort: TSort;
    pagination: {
      page: number;
      page_size: number;
    };
  }