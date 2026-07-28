import { inject } from "@angular/core";
import { UserModel } from "../models/user-model";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { UserService } from "../services/user/user.service";
import { ToastrService } from 'ngx-toastr';
import { CompletUserHelper } from "../helpers/complet-user-helper";
import { firstValueFrom } from "rxjs";
import { ConfidentialityModel } from "../models/confidentiality-model";

export interface UserState{
    user: UserModel | null,
    confidentiality: ConfidentialityModel | null;
    isError: boolean,
    error: string | null,
    loading: boolean,
    isLogged:boolean,
    isErrorMe: boolean,
}

const initialState: UserState ={
    user: null,
    confidentiality: null,
    isError: false,
    error: null,
    loading: false,
    isLogged: false,
    isErrorMe : false
}

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        service = inject(UserService),
        toastr = inject(ToastrService)
    ) => ({
        async Signup(model: ConfidentialityModel){
            patchState(store, { loading: true, error: null ,isError:false});
            try{
                const user = await firstValueFrom(service.signup(model));
                patchState(store, { user: user, loading: false,isLogged:true });
            }catch (err: any) {
                
                const msgError = err?.detail;
                
                patchState(store, { error: msgError, loading: false ,isError:true});
                //console.log("detail erreur : " + store.error())
            }
        },
        async Signin(model: CompletUserHelper){
            patchState(store, { loading: true, error: null ,isError:false});
            try{
                const signinOk = await firstValueFrom(service.signin(model));
                patchState(store, {loading: false});
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                
            }
        },
        
        async Me(){
            patchState(store, { loading: true, error: null ,isErrorMe:false});
            try{
                const user = await firstValueFrom(service.getUser());
                patchState(store, { user: user, loading: false,isLogged:true });
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isErrorMe:true});
                
            }
        },
        async Logout(){
            patchState(store, { loading: true, error: null ,isError:false});
            try{
                 await firstValueFrom(service.logout());
                patchState(store, { user: null, loading: false,isLogged:false });
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                
            }
        },
        async getConfidentiality(){
            patchState(store, { loading: true, error: null ,isErrorMe:false});
            try{
                const conf = await firstValueFrom(service.getConfidentiality());
                patchState(store, { confidentiality: conf, loading: false,isLogged:true });
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isErrorMe:true});
            }
        }

    }))
)