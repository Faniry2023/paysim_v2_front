import { Component, inject, signal } from '@angular/core';
import { SimulationStore } from '../storesim/sim.store';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-sim-test',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './sim-test.html',
  styleUrl: './sim-test.css',
})
export class SimTest {
  actor = signal<'v' | 'a'>('a');
  store = inject(SimulationStore);
  formBuilder = inject(FormBuilder);

  // ─── Formulaire vendeur : créer un paiement ───
  infoPayFormGroup = this.formBuilder.group({
    apiKey: ['', [Validators.required, Validators.maxLength(26), Validators.minLength(26)]],
    idOrder: [''],
    totalPrice: [1, [Validators.required, Validators.min(1)]],
    num: ['', [Validators.required]],
  });

  // ─── Formulaire vendeur : répondre à un achat (VerifieBuyer) ───
  sellerFormGroupe = this.formBuilder.group({
    ref: ['', [Validators.required]],
    con: [''],
    idDev: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    price: [1, [Validators.required, Validators.min(1)]],
  });
  id_projet = signal<string | null>(null);
  // ─── Formulaire acheteur : payer (VerifiePaySeller) ───
  continuationFormGroup = this.formBuilder.group({
    id_pay: ['', [Validators.required]],
    id_proj: ['', [Validators.required]],
    id_cust: ['', [Validators.required]],
    reason: ['', [Validators.required]],
    number: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(1)]],
    actionKey: ['', [Validators.required]],
    numberCUstomer: ['', [Validators.required]],
  });

  // ─── Au démarrage : connecter l'utilisateur au Hub ───
  async ngOnInit(): Promise<void> {
    await this.store.connectUser();
  }

  // ─── Vendeur : connecter son projet au Hub ───
  async connectProject(): Promise<void> {
    
    if (!this.id_projet()) {
      alert('Veuillez renseigner le Connection Id (Id du projet) avant de connecter.');
      return;
    }
    await this.store.connectProject(this.id_projet()!);
    alert(`Projet connecté ! ConnectionId projet : ${this.id_projet()}`);
  }

  // ─── Vendeur : créer un paiement via HTTP POST ───
  async save(): Promise<void> {
    if (!this.infoPayFormGroup.valid) return;
    const v = this.infoPayFormGroup.value;
    await this.store.save({
      apiKey: v.apiKey ?? '',
      idOrder: v.idOrder ?? '',
      totalprice: v.totalPrice ?? 0,
      infoNumber: v.num ?? '',
    });
    if(this.store.valueqr() != null){
      const id = this.store.valueqr()?.valueKey;
      const idProj = id?.match(/id_proj:([^/]+)/)?.[1]!;
      this.id_projet.set(idProj);
    }
  }

  // ─── Vendeur : envoyer VerifieBuyer au Hub ───
  async goHubVerifieBuyer(): Promise<void> {
    if (!this.sellerFormGroupe.valid) return;
    const v = this.sellerFormGroupe.value;
    await this.store.verifieBuyer({
      reference: v.ref ?? '',
      connectionId: v.con ?? '',
      idDeveloper: v.idDev ?? '',
      reason: v.reason ?? '',
      price: v.price ?? 0,
    });
  }

  // ─── Acheteur : envoyer VerifiePaySeller au Hub ───
  async goHubVerifiePaySeller(): Promise<void> {
    if (!this.continuationFormGroup.valid) return;
    const v = this.continuationFormGroup.value;
    await this.store.verifiePaySeller({
      idPayment: v.id_pay ?? '',
      idProject: v.id_proj ?? '',
      idCustomer: v.id_cust ?? '',
      reason: v.reason ?? '',
      number: v.number ?? '',
      price: v.price ?? 0,
      actionKey: v.actionKey ?? '',
      numberCUstomer: v.numberCUstomer ?? '',
    });
  }

  async ngOnDestroy(): Promise<void> {
    // Le service gère la déconnexion propre
  }
}
