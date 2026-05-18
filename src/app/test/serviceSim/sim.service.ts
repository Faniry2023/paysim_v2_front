import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SimService {
  private userConnection!: signalR.HubConnection;
  private projectConnection!: signalR.HubConnection;
  private baseUrl = "https://localhost:7110/payhubs";

  // Subjects pour écouter les événements du hub
  paymentSuccess$ = new Subject<boolean>();
  paymentError$ = new Subject<string>();

  // ─── Connexion utilisateur (acheteur ou vendeur en tant qu'utilisateur) ───
  async connectUser(): Promise<string> {
    this.userConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.baseUrl,{withCredentials:true}) // ← remplace par ton URL
      .withAutomaticReconnect()
      .build();

    this.userConnection.on('PaymentSuccess', (result: boolean) => {
      this.paymentSuccess$.next(result);
    });

    this.userConnection.on('PaymentError', (msg: string) => {
      this.paymentError$.next(msg);
    });

    this.userConnection.on('Erreur', (msg: string) => {
      this.paymentError$.next(msg);
    });

    await this.userConnection.start();
    return this.userConnection.connectionId ?? '';
  }

  // ─── Connexion projet (vendeur uniquement, avec type=project&id=...) ───
  async connectProject(projectId: string): Promise<string> {
    this.projectConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}?type=project&projectId=${projectId}`,{withCredentials:true}) // ← remplace par ton URL
      .withAutomaticReconnect()
      .build();

    this.projectConnection.on('PaymentSuccess', (result: boolean) => {
      this.paymentSuccess$.next(result);
    });

    this.projectConnection.on('Error', (msg: string) => {
      this.paymentError$.next(msg);
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
  }): Promise<void> {
    await this.userConnection.invoke('VerifieBuyer', {
      Reference: payload.reference,
      ConnectionId: payload.connectionId,
      IdDeveloper: payload.idDeveloper,
      Reason: payload.reason,
      Price: payload.price,
    });
  }

  // ─── Appel hub : Acheteur envoie VerifiePaySeller ───
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
    await this.userConnection.invoke('VerifiePaySeller', {
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
  async disconnect(): Promise<void> {
    if (this.userConnection) await this.userConnection.stop();
    if (this.projectConnection) await this.projectConnection.stop();
  }
}
