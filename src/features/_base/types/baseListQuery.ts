import { Sorting } from './sorting';
import { Paging } from './paging';

//export type SortOrder = "asc" | "desc";

// export interface Sorting {
//   sortColumn: string;
//   sortOrder: SortOrder;
// }

// export interface BaseListQuery<TFilter, TSorting> extends Paging, Sorting {
//   filter?: TFilter;
// }

export interface BaseListQuery<TFilter, TSortColumn extends string>
  extends Paging, Sorting<TSortColumn> {
  filter?: TFilter;
}