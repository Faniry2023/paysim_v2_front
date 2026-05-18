import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field'
import { Router } from '@angular/router';
import {MatInputModule} from '@angular/material/input'
import {MatButtonModule} from '@angular/material/button'
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner'
import {MatIconModule} from '@angular/material/icon'
import { ToastrService } from 'ngx-toastr';
import { UserStore } from '../../store/user.store';
import { UserModel } from '../../models/user-model';
import { ConfidentialityModel } from '../../models/confidentiality-model';
import { CompletUserHelper } from '../../helpers/complet-user-helper';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './signin.html',
  styleUrl: './signin.css',
})
export class Signin {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  toastr = inject(ToastrService);
  store = inject(UserStore);
  message = signal(false);
  passwordMatch:boolean = true;
  compteurTest = 0;
  focus = signal(false);
   hide = signal(true);
    sigingFormGroup = this.formBuilder.group({
      'firstname':['',[Validators.required]],
      'lastname':['',[Validators.required]],
      'addres':['',[Validators.required]],
      'birthday':['',[Validators.required]],
      'email':['',[Validators.required, Validators.email]],
      'mdp':['',[Validators.required]],
      'cfm':['',[Validators.required]]
    });
  ngOnInit(): void {
    this.compteurTest = 0;
  }
    onFocusCfm(){
      if(this.compteurTest < 3){
        this.message.set(true);
      }
      this.sigingFormGroup.get('cfm')?.valueChanges.subscribe(value =>{
        this.passwordMatch = value === this.sigingFormGroup.get('mdp')?.value;
      });
      this.sigingFormGroup.get('mdp')?.valueChanges.subscribe(() => {
      const confirm = this.sigingFormGroup.get('cfm')?.value;
      this.passwordMatch = confirm === this.sigingFormGroup.get('mdp')?.value;
      });
    }
    len = false;
    up = false;
    has = false;
  TestMdp(){
      if(this.compteurTest == 3){
        this.message.set(false)
      }
      if(this.hasLength){
        if(!this.len){
          this.len = true;
          this.compteurTest++;
        }
      }else{
        if(this.len){
          this.len = false;
          this.compteurTest--;
        }
      }
      if(this.hasUpperLower){
        if(!this.up){
          this.up = true;
          this.compteurTest++;
        }
      }else{
        if(this.up){
          this.up = false;
          this.compteurTest--;
        }
      }
      if(this.hasNumber){
        if(!this.has){
          this.has = true;
          this.compteurTest++;
        }
      }
      else{
        if(this.has){
          this.has = false;
          this.compteurTest--;
        }
      }
      if(this.compteurTest <= 0){
        this.compteurTest = 0;
      }
  }
    Out(){
      if(this.compteurTest <= 0){
        this.focus.set(false);
      }
    }
    onFocusInput(){
      this.focus.set(true);
    }
    //recuperer le mot de passe
    get password(){
      return this.sigingFormGroup.get('mdp')?.value || '';
    }

    //Verification du mot de passe
    get hasLength(){
      return this.password.length >= 5;
    }
    get hasUpperLower() {
      return /[a-z]/.test(this.password) && /[A-Z]/.test(this.password);
    }

    get hasNumber() {
      return /\d/.test(this.password);
    }
  
    async siging(){
      if(this.sigingFormGroup.valid){
        const user : UserModel = {
          id: '',
          idConfidentiality:'',
          firstName: this.sigingFormGroup.value.firstname!,
          lastName: this.sigingFormGroup.value.lastname!,
          address: this.sigingFormGroup.value.addres!,
          birthday: this.sigingFormGroup.value.birthday!,
          accountOk: true
        }

        const confidentiality: ConfidentialityModel ={
          id: '',
          email: this.sigingFormGroup.value.email!,
          Password: this.sigingFormGroup.value.mdp!,
        }
        const completUser: CompletUserHelper = {
          userHelper: user,
          confidentialityHelper: confidentiality
        }
        await this.store.Signin(completUser);
        if(this.store.isError()){
          this.toastr.error('Erreur d\'inscription',this.store.error()!);
        }
        else{
          this.router.navigate(['/signup'])
        }

        // this.logSigService.siging(utilisateur).subscribe({
        //   next:() =>{
        //     this.isLoading = false;
        //     this.router.navigate(['/login'])
        //   },
        //   error:(err) =>{
        //     this.isLoading = false;
        //     alert("Une erreur survenue")
        //   }
        // })
      }
    }
    togglePassword(event:MouseEvent){
    this.hide.set(!this.hide());
    event.stopPropagation();
    }

}
