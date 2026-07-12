import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { ValueQr } from "../helpers/value-qr";
import { inject } from "@angular/core";
import { SimulationService } from "../services/simulation/simulation.service";
import { InfoPaiDevHelper } from "../helpers/info-pai-dev-helper";
import { firstValueFrom } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { ContinuationPaymentHelper } from "../helpers/continuation-payment-helper";
import { SellerCheckHelper } from "../helpers/seller-check-helper";

export interface SimulationState{
    valueqr: ValueQr | null;
    isError: boolean;
    error: string | null;
    loading: boolean;
    isValide: boolean;
    userConnectionId: string | null;
    projectConnectionId: string | null;
}

const initialState: SimulationState = {
    valueqr: null,
    isError: false,
    error: null,
    loading: false,
    isValide: false,
    userConnectionId: null,
    projectConnectionId: null
}

export const SimulationStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((store,
        service = inject(SimulationService),
        toastr = inject(ToastrService)
    ) =>({
        async getInfo(model: InfoPaiDevHelper){
            patchState(store,{loading:true, isError: false, error: null});
            try{
                const valueQr = await firstValueFrom(service.getSetupInfo(model));
                patchState(store,{loading: false, valueqr: valueQr});
            }catch (err: any) {
                const msgError = err?.detail;
                patchState(store, { error: msgError, loading: false ,isError:true});
                toastr.error(msgError,'Erreur');
            }
        },

        async connectUser(): Promise<void>{
            try{
                const connectionId = await service.connectUser();
                patchState(store,{userConnectionId: connectionId});

                //Ecouter PaymentSucces
                service.paymentSuccess$.subscribe((ok) =>{
                    if(ok) patchState(store,{isValide: true});
                });

                service.paymentError$.subscribe((msg) =>{
                    patchState(store,{error: msg});
                })
            }catch(e){
                console.error('Erreur connexion utilisateur Hub:', e);
            }
        },
        async connectProject(projectId: string):Promise<void>{
            try{
                const connectionId = await service.connectProject(projectId);

                //Ecouter PaymentSucces
                service.paymentSuccess$.subscribe((ok) =>{
                    if(ok) patchState(store,{isValide: true});
                });
                service.paymentError$.subscribe((msg) =>{
                    patchState(store,{error: msg});
                })
                patchState(store,{projectConnectionId: connectionId});
            }catch(e){
                console.error('Erreur connexion projet Hub:', e);
            }
        },

      // ─── Vendeur envoie VerifieBuyer au Hub ───
      async verifieBuyer(payload: SellerCheckHelper):Promise<void>{
        patchState(store,{loading: true, error: null});
        try{
            await service.verifieBuyer(payload);
            service.paymentError$.subscribe((msg) =>{
                    patchState(store,{error: msg});
                })
        }catch(e:any){
            console.error('Erreur lors de la vérification vendeur:', e);
           // patchState(store,{error:'Erreur lors de la vérification vendeur'});
        }finally{
            patchState(store,{loading:false});
        }
      },

      // ─── Acheteur envoie VerifiePaySeller au Hub ───
      async verifiePaySeller(payload: ContinuationPaymentHelper):Promise<void>{
        
        patchState(store,{loading: true, error: null});
        try{
            
            await service.verifiePaySeller(payload);
            // console.log('continuation dans store')
            service.paymentError$.subscribe((msg) =>{
                    patchState(store,{error: msg});
                })
            patchState(store,{loading:false});
            
        }catch(e: any){
            console.error('Erreur verifiePaySeller:', e);
            //patchState(store,{error: 'Erreur lors de la vérification acheteur'});
        }finally{
            patchState(store,{loading:false});
        }
      },

      resetError():void{
        patchState(store,{error:null});
      }

    }))
)