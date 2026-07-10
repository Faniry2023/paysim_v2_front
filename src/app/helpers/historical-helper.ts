import { HistoricalModel } from "../models/historical-model";

export interface HistoricalHelper {
    page: number;
    count: number;
    historicals: HistoricalModel[]; 
}