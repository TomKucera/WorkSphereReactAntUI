import type { BaseListQuery } from "../../_base/types/baseListQuery";
import type { WorkFilter } from "./workFilter";
import type { WorkSortableColumn } from "./workSortableColumn"

export type WorkListQuery = BaseListQuery<WorkFilter, WorkSortableColumn>;
