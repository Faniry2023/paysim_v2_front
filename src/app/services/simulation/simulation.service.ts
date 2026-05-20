import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { InfoPaiDevHelper } from '../../helpers/info-pai-dev-helper';
import { ValueQr } from '../../helpers/value-qr';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private userConnection!: signalR.HubConnection;
  private projectConnection!: signalR.HubConnection;
  private httpClient = inject(HttpClient);
  // private baseUrl = "https://localhost:7110/";
  private baseUrl = "https://we-explore-mada.runasp.net/";
  // private baseUrlHub = "https://localhost:7110/payhubs";
  private baseUrlHub = "https://we-explore-mada.runasp.net/payhubs";


  paymentSuccess$ = new Subject<boolean>();
  paymentError$ = new Subject<string>();

    // ─── Connexion utilisateur (acheteur ou vendeur en tant qu'utilisateur) ───
  async connectUser(): Promise<string>{
    this.userConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.baseUrlHub,{withCredentials:true})
    .withAutomaticReconnect()
    .build();

    this.userConnection.on('PaymentSuccess',(result: boolean) =>{
      this.paymentSuccess$.next(result);
    });

    this.userConnection.on('PaymentError',(msg: string) =>{
      this.paymentError$.next(msg);
    });

    this.userConnection.on('Erreur',(msg: string) =>{
      this.paymentError$.next(msg);
    });

    await this.userConnection.start();
    return this.userConnection.connectionId ?? '';
  }

  // ─── Connexion projet (vendeur uniquement, avec type=project&id=...) ───
  async connectProject(projectId: string): Promise<string>{
    this.projectConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${this.baseUrlHub}?type=project&projectId=${projectId}`,{withCredentials:true})
    .withAutomaticReconnect()
    .build();

    this.projectConnection.on('PaymentSuccess',(result: boolean) => {
      this.paymentSuccess$.next(result);
    });

    this.projectConnection.on('Error', (msg: string) =>{
      this.paymentError$.next(msg)
    });

    await this.projectConnection.start();
    return this.projectConnection.connectionId ?? '';
  }


  // ─── Appel hub : Vendeur envoie VerifieBuyer ───
  async verifieBuyer(payload: {
    reference: string;
    connectionId: string;
    idDeveloper: string;
    reason: string;
    price: number;
  }): Promise<void>{
    await this.userConnection.invoke('VerifieBuyer',{
      Reference: payload.reference,
      ConnectionId: payload.connectionId,
      IdDeveloper: payload.idDeveloper,
      Reason: payload.reason,
      Price: payload.price,
    });
  }

  // ─── Appel hub : Acheteur envoie VerifiePaySeller ───
  async verifiePaySeller(payload:{
    idPayment: string;
    idProject: string;
    idCustomer: string;
    reason: string;
    number: string;
    price: number;
    actionKey: string;
    numberCUstomer: string;
  }):Promise<void>{
    await this.userConnection.invoke('VerifiePaySeller',{
      IdPayment: payload.idPayment,
      IdProject: payload.idProject,
      IdCustomer: payload.idCustomer,
      Reason: payload.reason,
      Number: payload.number,
      Price: payload.price,
      ActionKey: payload.actionKey,
      NumberCUstomer: payload.numberCUstomer,
    });
  }

  // ─── Déconnexion propre ───
  async disconnect(): Promise<void>{
    if(this.userConnection) await this.userConnection.stop();
    if(this.projectConnection) await this.projectConnection.stop();
  }



  //create a new Paiment
  getSetupInfo(model: InfoPaiDevHelper):Observable<ValueQr>{
    return this.httpClient.post<ValueQr>(this.baseUrl + 'developer/info/setup', model, {withCredentials:true})
    .pipe(catchError(this.handleError))
  }


  //error
  private handleError(error: HttpErrorResponse) {
    if (error.error?.title && error.error?.detail) {
      // Erreur ProblemDetails (provenant de .NET 8)
      return throwError(() => ({
        status: error.status,
        title: error.error.title,
        detail: error.error.detail
      }));
    }
    // Erreur générique
    return throwError(() => ({
      status: error.status,
      title: "Erreur inconnue",
      detail: "Une erreur inattendue est survenue."
    }));
  }
}
