import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { HistoricalSmsService } from "../services/historical-sms/historical-sms.service";
import { ToastrService } from "ngx-toastr";
import { HistoricalSmsModel } from "../models/historical-sms-model";
import { firstValueFrom } from "rxjs";
import { HistoricalSmsSearchHelper } from "../helpers/historical-sms-search-helper";

export interface HistoricalSmsState{
    historicals: HistoricalSmsModel[] | [];
    count: number;
    page: number;
    balance: number;
    error: string | null;
    isError: boolean;
    isLoading: boolean;
}

const initialState: HistoricalSmsState = {
    historicals: [] as HistoricalSmsModel[],
    count: 0,
    page: 0,
    balance: 0,
    error: null,
    isError: false,
    isLoading: false,
}

export const HistoricalSmsStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        service = inject(HistoricalSmsService),
        toastr = inject(ToastrService)
    ) =>({
        async getAllHistorical(page: number, step: number){
            patchState(store,{isLoading:true, isError:false, historicals: [] as HistoricalSmsModel[]});
            try{
                const historicalHelper = await firstValueFrom(service.getAllHistorical(page, step));
                patchState(store,{isLoading: false,historicals: historicalHelper.historicalSms, count: historicalHelper.count, page: historicalHelper.page, balance: historicalHelper.balance});
            }catch(err: any){
                patchState(store,{error:err?.detail,isLoading:false,isError:true});
                toastr.error(err?.detail,'Erreur');
            }
        },
        async searchHistorical(payback: HistoricalSmsSearchHelper){
            patchState(store,{isLoading:true, isError:false, historicals: [] as HistoricalSmsModel[]});
            try{
                const historicalHelper = await firstValueFrom(service.searchHistorical(payback));
                patchState(store,{isLoading: false,historicals: historicalHelper.historicalSms, count: historicalHelper.count, page: historicalHelper.page});
            }catch(err: any){
                patchState(store,{error:err?.detail,isLoading:false,isError:true});
                toastr.error(err?.detail,'Erreur');
            }
        }
    }))
)