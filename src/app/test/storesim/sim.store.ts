import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SimService } from '../serviceSim/sim.service';

export interface InfoPaiDevHelper {
  apiKey: string;
  idOrder: string;
  totalprice: number;
  infoNumber: string;
}

export interface ValueQr {
  valueKey: string;
}

interface SimulationState {
  loading: boolean;
  valueqr: ValueQr | null;
  userConnectionId: string | null;
  projectConnectionId: string | null;
  isValide: boolean;
  error: string | null;
}

const initialState: SimulationState = {
  loading: false,
  valueqr: null,
  userConnectionId: null,
  projectConnectionId: null,
  isValide: false,
  error: null,
};

const BASE_URL = 'https://localhost:7110/'; // ← remplace par ton URL

export const SimulationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const http = inject(HttpClient);
    const hubService = inject(SimService);

    return {

      // ─── Connexion utilisateur au démarrage du composant ───
      async connectUser(): Promise<void> {
        try {
          const connectionId = await hubService.connectUser();
          patchState(store, { userConnectionId: connectionId });

          // Écouter PaymentSuccess
          hubService.paymentSuccess$.subscribe((ok) => {
            if (ok) patchState(store, { isValide: true });
          });

          // Écouter les erreurs
          hubService.paymentError$.subscribe((msg) => {
            patchState(store, { error: msg });
            console.error('Erreur Hub:', msg);
          });
        } catch (e) {
          console.error('Erreur connexion utilisateur Hub:', e);
        }
      },

      // ─── Connexion projet (vendeur uniquement) ───
      async connectProject(projectId: string): Promise<void> {
        try {
          const connectionId = await hubService.connectProject(projectId);
          patchState(store, { projectConnectionId: connectionId });
        } catch (e) {
          console.error('Erreur connexion projet Hub:', e);
        }
      },

      // ─── Save : vendeur envoie les infos pour créer un paiement ───
      async save(model: InfoPaiDevHelper): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(
            http.post<ValueQr>(`${BASE_URL}developer/info/setup`, {
              apiKey: model.apiKey,
              idOrder: model.idOrder,
              totalprice: model.totalprice,
              infoNumber: model.infoNumber,
            })
          );
          patchState(store, { valueqr: result });
        } catch (e: any) {
          patchState(store, { error: e?.error?.detail ?? 'Erreur lors de la création du paiement' });
          console.error(e);
        } finally {
          patchState(store, { loading: false });
        }
      },

      // ─── Vendeur envoie VerifieBuyer au Hub ───
      async verifieBuyer(payload: {
        reference: string;
        connectionId: string;
        idDeveloper: string;
        reason: string;
        price: number;
      }): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await hubService.verifieBuyer(payload);
        } catch (e: any) {
          patchState(store, { error: 'Erreur lors de la vérification vendeur' });
          console.error(e);
        } finally {
          patchState(store, { loading: false });
        }
      },

      // ─── Acheteur envoie VerifiePaySeller au Hub ───
      async verifiePaySeller(payload: {
        idPayment: string;
        idProject: string;
        idCustomer: string;
        reason: string;
        number: string;
        price: number;
        actionKey: string;
        numberCUstomer: string;
      }): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await hubService.verifiePaySeller(payload);
        } catch (e: any) {
          patchState(store, { error: 'Erreur lors de la vérification acheteur' });
          console.error(e);
        } finally {
          patchState(store, { loading: false });
        }
      },

      resetError(): void {
        patchState(store, { error: null });
      },
    };
  })
);
