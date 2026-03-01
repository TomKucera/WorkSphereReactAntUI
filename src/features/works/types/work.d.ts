// export interface Work {
//     id: number;
//     provider: string;
//     originalId: string;
//     name: string;
//     description: string;
//     url: string;
//     company: string;
//     // mainArea: string;
//     // collaborations: string;
//     // areas: string;
//     // seniorities: string;
//     addedByScanId: number;
//     removedByScanId: number;
//     snapshotFileName: string;
//     available: boolean;
//     workApplicationId: number;
//   }

export interface Work {
    id: number;
    provider: string;
    originalId: string;
    name: string;
    company: string;
    url: string;
    addedByScanId: number;
    removedByScanId: number | null;
    remoteRatio: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
}