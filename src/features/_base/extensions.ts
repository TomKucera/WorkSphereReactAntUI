import { Sorting } from './types/sorting'

export const getNextSortState = <TColumn extends string>(
    current: Sorting<TColumn>,
    column: TColumn
  ): Sorting<TColumn> => {
  
    if (current.sortColumn !== column) {
      return { sortColumn: column, sortOrder: "asc" };
    }
  
    if (current.sortOrder === "asc") {
      return { sortColumn: column, sortOrder: "desc" };
    }
  
    if (current.sortOrder === "desc") {
      return { sortColumn: null, sortOrder: null };
    }
  
    return { sortColumn: column, sortOrder: "asc" };
  };