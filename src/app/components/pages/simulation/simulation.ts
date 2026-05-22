import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SimulationStore } from '../../../store/simulation.store';
import { InfoPaiDevHelper } from '../../../helpers/info-pai-dev-helper';
import { ContinuationPaymentHelper } from '../../../helpers/continuation-payment-helper';
import { SellerCheckHelper } from '../../../helpers/seller-check-helper';

@Component({
  selector: 'app-simulation',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,
    MatProgressSpinnerModule],
  templateUrl: './simulation.html',
  styleUrl: './simulation.css',
})
export class Simulation implements OnInit{
  valueQr = signal<string | null>(null);
  isValide = signal(true)
  projectConnect = signal(false);
  actor = signal<'v' | 'a'>('v');
  store = inject(SimulationStore);
  formBuilder = inject(FormBuilder);
  id_project = signal<string | null>(null);
  infoPayFormGroup = this.formBuilder.group({
    apiKey: ['',[Validators.required,Validators.maxLength(26),Validators.minLength(26)]],
    idOrder: [''],
    totalPrice: [1,[Validators.required,Validators.min(1)]],
    num: ['',[Validators.required]]
  })

  sellerFormGroupe = this.formBuilder.group({
    ref:[''],
    con: [''],
    idDev: ['',[Validators.required]],
    reason: ['',[Validators.required]],
    price: [1,[Validators.required,Validators.min(1)]],
    balance: [1,[Validators.required,Validators.min(0)]],
    name_b: ['',[Validators.required]],
    num_b:['',[Validators.required]]
  })
  async ngOnInit(): Promise<void> {
    await this.store.connectUser();
  }

  // ─── Vendeur : connecter son projet au Hub ───
  async connectProjet(): Promise<void>{
    this.projectConnect.set(false);
    if(!this.id_project()){
      alert('Veuillez renseigner le Connection Id (Id du projet) avant de connecter.');
      return;
    }

    await this.store.connectProject(this.id_project()!);
    this.projectConnect.set(true);
  }

  continuationFormGroup = this.formBuilder.group({
    id_pay:['',[Validators.required]],
    id_proj:['',[Validators.required]],
    id_cust:['',[Validators.required]],
    reason:['',[Validators.required]],
    number:['',[Validators.required]],
    price:[0,[Validators.required]],
    actionKey:['',[Validators.required]],
    numberCUstomer:['',[Validators.required]]
  })
  async goHubVerifieBuyer():Promise<void>{
    if(!this.sellerFormGroupe.value) return;
    const v = this.sellerFormGroupe.value;
    const seller: SellerCheckHelper = {
      reference: v.ref!,
      connectionId: v.con!,
      idDeveloper: v.idDev!,
      reason: v.reason!,
      price: v.price!,
      sellerBalance: v.balance!.toString(),
      buyerNumber: v.num_b!,
      buyerName: v.name_b!
    }
    await this.store.verifieBuyer(seller);
  }
  async goHubVerifiePaySeller(): Promise<void>{
    if(!this.continuationFormGroup.valid) return;
    const v = this.continuationFormGroup.value;
    const continuation: ContinuationPaymentHelper = {
      idPayment: v.id_pay!,
      idProject: v.id_proj!,
      idCustomer: v.id_cust!,
      reason: v.reason!,
      number: v.number!,
      price: v.price!,
      actionKey: v.actionKey!,
    };

    await this.store.verifiePaySeller(continuation);
  }
  async save(){
    if(!this.infoPayFormGroup.valid) return;
    const v = this.infoPayFormGroup.value;
    const infoPay: InfoPaiDevHelper = {
      apiKey: v.apiKey!,
      idOrder: v.idOrder!,
      totalprice: v.totalPrice!,
      infoNumber: v.num!,
    };
    await this.store.getInfo(infoPay);
    if(!this.store.valueqr()) return;
    const id = this.store.valueqr()?.valueKey;
    const idProj = id?.match(/id_proj:([^/]+)/)?.[1]!;
    this.id_project.set(idProj);
  }

  async ngOnDestroy(): Promise<void>{}
}
