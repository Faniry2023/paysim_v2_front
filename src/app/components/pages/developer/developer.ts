import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeveloperStore } from '../../../store/developer.store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeveloperModel } from '../../../models/developer-model';

@Component({
  selector: 'app-developer',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,MatProgressSpinnerModule],
  templateUrl: './developer.html',
  styleUrl: './developer.css',
})
export class Developer implements OnInit{
  async ngOnInit() {
    await this.developerStore.GetDeveloer();
    if(!this.developerStore.isError()){
      this.developerAccount.set(this.developerStore.developer());
    }
    if(this.developerAccount() !== null){
      this.isCreateNewCompte.set(false)
      this.developerFormGroup.disable();
    }
  }

  isCreateNewCompte = signal(true);

  private formBuilder = inject(FormBuilder);
  developerAccount = signal<DeveloperModel | null>(null);
  isUpdate = signal(false);
  developerStore = inject(DeveloperStore);
  apiKey = signal<string | undefined>(undefined);

  developerFormGroup = this.formBuilder.group({
    cin:['',[Validators.required,Validators.minLength(12),Validators.maxLength(12)]],
    yas:[''],
    air:[''],
    org:[''],
  });


  isNumOk = signal(true);
  async save(){
    if((this.developerFormGroup.value.air === null || this.developerFormGroup.value.air === '') &&
        (this.developerFormGroup.value.yas === null || this.developerFormGroup.value.yas === '') &&
        (this.developerFormGroup.value.org === null || this.developerFormGroup.value.org === '')
    ){
      this.isNumOk.set(false);
    }else{
      if(this.developerFormGroup.valid){
        const yas = this.developerFormGroup.value.yas;
        const org = this.developerFormGroup.value.org;
        const air = this.developerFormGroup.value.air;
        const newDeveloper: DeveloperModel = {
          id : this.isUpdate() ? this.developerAccount()?.id! : '',
          idUser: this.isUpdate() ? this.developerAccount()?.idUser! : '',
          cin: this.developerFormGroup.value.cin!,
          numberYas:(yas === '') ? 'N/A' : yas!,
          numberOrange:(org === '') ? 'N/A' : org!,
          numberAirtel:(air === '') ? 'N/A' : air!,
        }

        if(this.isUpdate()){
          await this.developerStore.UpdateDeveloper(newDeveloper);
          this.isUpdate.set(false);
        }else{
          await this.developerStore.NewDev(newDeveloper);
        }
      }
    }
  }

  update(){
    this.isUpdate.set(true);
    this.developerFormGroup.enable();
    this.developerFormGroup.get('cin')?.setValue(this.developerAccount()?.cin!);
    this.developerFormGroup.get('yas')?.setValue(this.developerAccount()?.numberYas!);
    this.developerFormGroup.get('org')?.setValue(this.developerAccount()?.numberOrange!);
    this.developerFormGroup.get('air')?.setValue(this.developerAccount()?.numberAirtel!);
  }
  cancel(){
    this.developerFormGroup.reset();
    this.developerFormGroup.disable();
    this.isUpdate.set(false);
  }

}
