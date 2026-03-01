import type { BaseListQuery } from "../../_base/types/baseListQuery";
import type { CvFilter } from "./cvFilter";

export type CvSortableColumn =
  | "Id"
  | "Name"
  | "Note"
  | "OriginalFileName"
  | "ContentType"
  | "Active"
  | "CreatedAt"
  | "UpdatedAt"
 ;

export type CvListQuery = BaseListQuery<CvFilter, CvSortableColumn>;
