import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { HistoricalModel } from "../models/historical-model";
import { inject } from "@angular/core";
import { HistoicalService } from "../services/historical/histoical.service";
import { firstValueFrom } from "rxjs";
import { ToastrService } from "ngx-toastr";

export interface HistoricalState{
    historicals: HistoricalModel[] | [];
    count: number;
    page: number;
    error: string | null;
    isError: boolean;
    isLoading: boolean;
}

const initialState: HistoricalState = {
    historicals: [] as HistoricalModel[],
    count: 0,
    page: 0,
    error: null,
    isError: false,
    isLoading: false,
}

export const HistoricalStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        service = inject(HistoicalService),
        toastr = inject(ToastrService)
    ) =>({
        async getAllHistorical(page: number, step: number){
            patchState(store,{isLoading:true, isError:false, historicals: [] as HistoricalModel[]});
            try{
                const historicalHelper = await firstValueFrom(service.getAllHistorical(page, step));
                patchState(store,{isLoading: false,historicals: historicalHelper.historicals, count: historicalHelper.count, page: historicalHelper.page});
            }catch(err: any){
                patchState(store,{error:err?.detail,isLoading:false,isError:true});
                toastr.error(err?.detail,'Erreur');
            }
        }
    }))
)