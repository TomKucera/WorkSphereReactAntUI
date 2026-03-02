import { WorkFilter } from "../types/workFilter";
import { Sorting } from "../../_base/types/sorting";
import { WorkSortableColumn } from "../types/workSortableColumn";

export const DEFAULT_PAGE_SIZE = 15;

export const defaultFilter: WorkFilter = {
  active: true,
  application: false,
};

export const defaultSorting: Sorting<WorkSortableColumn> = {
  sortColumn: "CreatedAt",
  sortOrder: "desc",
};