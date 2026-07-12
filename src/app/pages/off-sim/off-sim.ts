import { Component, inject, signal } from '@angular/core';
import { InfoPaiDevHelper } from '../../helpers/info-pai-dev-helper';
import { ContinuationPaymentHelper } from '../../helpers/continuation-payment-helper';
import { SellerCheckHelper } from '../../helpers/seller-check-helper';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SimulationStore } from '../../store/simulation.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-off-sim',
  imports: [ReactiveFormsModule,MatProgressSpinnerModule,
    MatFormFieldModule,MatInputModule
  ],
  templateUrl: './off-sim.html',
  styleUrl: './off-sim.css',
})
export class OffSim {
  paymentRun = signal(false);
  loadingInfoPay = signal(false)
  loadingSeller = signal(false)
  loadingConti = signal(false)
  valueQr = signal<string | null>(null);
  isValid = signal(true);
  projectConnect = signal(false);
  actor = signal<'v' | 'a'>('v');
  store = inject(SimulationStore);
  formBuilder = inject(FormBuilder);
  //id_project = signal<string | null>(null);
  id_payment = signal<string | null>(null);
  infoPayFormGroup = this.formBuilder.group({
    apiKey: ['',[Validators.required]],
    idOrder: [''],
    totalPrice: [1,[Validators.required,Validators.min(1)]],
    num: ['',[Validators.required]],
    email: ['',[Validators.required]]
  })

  sellerFormGroupe = this.formBuilder.group({
    ref:['',[Validators.required]],
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
    if(!this.id_payment()){
      alert('Veuillez renseigner le Connection Id (Id du projet) avant de connecter.');
      return;
    }

    await this.store.connectProject(this.id_payment()!);
    this.projectConnect.set(true);
  }

  continuationFormGroup = this.formBuilder.group({
    id_pay:['',[Validators.required]],
    id_proj:['',[Validators.required]],
    id_cust:['',[Validators.required]],
    reason:['',[Validators.required]],
    number:['',[Validators.required]],
    price:[1,[Validators.required,Validators.min(1)]],
    actionKey:['',[Validators.required]],
  })
  async goHubVerifieBuyer():Promise<void>{
    if(!this.sellerFormGroupe.value) return;
    this.loadingSeller.set(true);
    const v = this.sellerFormGroupe.value;
    const seller: SellerCheckHelper = {
      reference: v.ref!,
      connectionId: v.con!,
      idDeveloper: v.idDev!,
      reason: v.reason!,
      price: v.price!,
      sellerBalance: v.balance!,
      buyerNumber: v.num_b!,
      buyerName: v.name_b!
    }
    await this.store.verifieBuyer(seller);
    this.loadingSeller.set(false);
    if(this.store.isValide()){
      this.paymentRun.set(false);
    }
  }
  async goHubVerifiePaySeller(): Promise<void>{
    
    if(!this.continuationFormGroup.valid){
      alert('Remplir tous les champs demandé')
      return
    }
    this.loadingConti.set(true);
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
    this.loadingConti.set(false);
    if(this.store.isValide()){
      this.paymentRun.set(false);
    }
    console.log('continuation en action')
  }
  async save(){
    this.paymentRun.set(false);
    if(!this.infoPayFormGroup.valid) return;
    this.loadingInfoPay.set(true);
    const v = this.infoPayFormGroup.value;
    const infoPay: InfoPaiDevHelper = {
      apiKey: v.apiKey!,
      idOrder: v.idOrder!,
      totalprice: v.totalPrice!,
      infoNumber: v.num!,
      email: v.email!
    };
    await this.store.getInfo(infoPay);
    if(this.store.isError()) this.loadingInfoPay.set(false);
    if(!this.store.valueqr()) return;
    const id = this.store.valueqr()?.valueKey;
   const paymentId = id?.match(/id:([^/]+)/)?.[1];
    //const idProj = id?.match(/id_proj:([^/]+)/)?.[1]!;
    this.id_payment.set(paymentId!);
    this.loadingInfoPay.set(false);
    if(!this.store.isError()){
      this.projectConnect.set(false)
      if(!this.id_payment()){
        alert('Veuillez renseigner le Connection Id (Id du projet) avant de connecter.');
        return;
      }
      await this.store.connectProject(this.id_payment()!);
      if(!this.store.isError()){
        this.projectConnect.set(true)
        this.paymentRun.set(true);
      }
    }
  }

  isFieldValidCreatePay(name:string){
    const formControl = this.infoPayFormGroup.get(name);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched)
  }
  isFieldValidSeller(name:string){
    const formControl = this.sellerFormGroupe.get(name);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched)
  }
  isFieldValidContinuation(name:string){
    const formControl = this.continuationFormGroup.get(name);
    return formControl?.invalid && (formControl?.dirty || formControl?.touched)
  }


  async ngOnDestroy(): Promise<void>{}
}
