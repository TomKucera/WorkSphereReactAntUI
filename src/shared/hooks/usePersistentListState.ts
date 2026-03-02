import { useEffect, useState } from "react";
import { PersistentState } from "../storage/PersistentState";
import { ListState } from "../types/listState";
import { shallowEqual } from "../utils/shallowEqual";

export function usePersistentListState<TFilter, TSort>(options: {
  storageKey: string;
  defaultFilter: TFilter;
  defaultSort: TSort;
  defaultPageSize: number;
}) {
  const {
    storageKey,
    defaultFilter,
    defaultSort,
    defaultPageSize,
  } = options;

  const storage = new PersistentState<ListState<TFilter, TSort>>(
    storageKey,
    { version: 1 }
  );

  const initial = storage.load({
    filters: defaultFilter,
    sort: defaultSort,
    pagination: { page: 1, page_size: defaultPageSize },
  });

  const [filters, setFilters] = useState<TFilter>(initial.filters);
  const [sort, setSort] = useState<TSort>(initial.sort);
  const [pagination, setPagination] = useState(initial.pagination);

  useEffect(() => {
    storage.save({ filters, sort, pagination });
  }, [filters, sort, pagination]);

  const reset = () => {
    setFilters(defaultFilter);
    setSort(defaultSort);
    setPagination({ page: 1, page_size: defaultPageSize });
    storage.clear();
  };

  const isDefault =
    shallowEqual(filters as any, defaultFilter as any) &&
    shallowEqual(sort as any, defaultSort as any) &&
    pagination.page === 1 &&
    pagination.page_size === defaultPageSize;

  return {
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    setPagination,
    reset,
    isDefault,
  };
}