import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { DeveloperModel } from "../models/developer-model";
import { inject } from "@angular/core";
import { DeveloperService } from "../services/developer/developer.service";
import { ToastrService } from "ngx-toastr";
import { firstValueFrom } from "rxjs";
import { ApiHelper } from "../helpers/api-helper";

export interface DeveloperState{
    developer: DeveloperModel | null,
    isError: boolean,
    error: string | null,
    loading: boolean,
}

const initialState: DeveloperState ={
    developer: null,
    isError: false,
    error: null,
    loading: false,
}

export const DeveloperStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        service = inject(DeveloperService),
        toastr = inject(ToastrService)
    ) =>({
        async NewDev(model: DeveloperModel){
            patchState(store,{isError:false, developer: null,loading:true,error:null});
            try{
                const developer = await firstValueFrom(service.newDeveloper(model));
                patchState(store,{loading:false,developer:developer});
                toastr.success('Compte developpeur créer','Success')
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async GetDeveloer(){
            patchState(store,{loading:true, isError:false, error: null, developer: null});
            try{
                const developer = await firstValueFrom(service.getDeveloper());
                patchState(store,{loading: false, developer: developer});
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async UpdateDeveloper(model: DeveloperModel){
            patchState(store,{loading: true, isError: false, error: null});
            try{
                const updateDeveloper = await firstValueFrom(service.updateDeveloper(model));
                patchState(store,{loading:false, developer:updateDeveloper});
                toastr.info('Mise à jours éfféctuer', 'Mise à jours OK');
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        }
    }))
)