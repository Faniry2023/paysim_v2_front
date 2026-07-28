import { HistoricalSmsModel } from "../models/historical-sms-model";

export interface HistoricalSmsHelper {
    page: number;
    count: number;
    balance: number;
    historicalSms: HistoricalSmsModel[];
}
