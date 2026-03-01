import type { BaseListQuery } from "../../_base/types/baseListQuery";
import type { WorkFilter } from "./workFilter";

export type WorkSortableColumn =
  | "Id"
  | "Provider"
  | "OriginalId"
  | "Company"
  | "Name"
  | "Description"
  | "Salary"
  | "Remote"
  | "CreatedAt"
  | "DeletedAt";

export type WorkListQuery = BaseListQuery<WorkFilter, WorkSortableColumn>;
