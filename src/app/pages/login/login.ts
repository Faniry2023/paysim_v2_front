import { Component, inject, Signal, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserStore } from '../../store/user.store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ConfidentialityHelper } from '../../helpers/confidentiality-helper';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule, MatIconModule, MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  store = inject(UserStore)
  hide = signal(true);
  errorMessage = signal<boolean>(false);
  loginFormGroup = this.formBuilder.group({
    'email':['',[Validators.required]],
    'mdp':['',[Validators.required]],
    'remember':[false]
  });

  async login(){
    this.errorMessage.set(false);
    if(this.loginFormGroup.valid){
      const loginData: ConfidentialityHelper = {
        id:'',
        email: this.loginFormGroup.value.email!,
        Password: this.loginFormGroup.value.mdp!,
        remeber: this.loginFormGroup.value.remember!
      }

      await this.store.Signup(loginData);
      
      if(!this.store.isError()){
        this.router.navigate(['home'],
            {replaceUrl:true}
          );
      }else{
        
        this.errorMessage.set(true);
      }
    }
  }
  togglePassword(event:MouseEvent){
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}

