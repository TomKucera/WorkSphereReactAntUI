import type { BaseListQuery } from "../../_base/types/baseListQuery";
import type { WorkApplicationFilter } from "./workApplicationFilter";

export type WorkApplicationSortableColumn =
  | "Id"
  | "WorkName"
  | "WorkCompany"
  | "WorkProvider"
  | "CreatedAt"
  | "UpdatedAt"
  | "Email"
  | "Phone"
  | "Message"
  | "Status";

export type WorkApplicationListQuery = BaseListQuery<WorkApplicationFilter, WorkApplicationSortableColumn>;
