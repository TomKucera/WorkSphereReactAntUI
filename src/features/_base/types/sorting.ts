export type SortOrder = "asc" | "desc";

export type Sorting<TColumn extends string> = {
    sortColumn?: TColumn | null;
    sortOrder?: SortOrder | null;
};