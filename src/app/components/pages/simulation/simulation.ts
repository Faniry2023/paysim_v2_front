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
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Logout } from '../../popup/logout/logout';

@Component({
  selector: 'app-simulation',
  imports: [ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule,
    MatProgressSpinnerModule],
  templateUrl: './simulation.html',
  styleUrl: './simulation.css',
})
export class Simulation implements OnInit{
  store = inject(SimulationStore);
  router = inject(Router);
  dialog = inject(MatDialog);
  async ngOnInit(): Promise<void> {
    await this.store.connectUser();
  }
  goOffSim(){
    this.router.navigate(["/simulation_paysim"]);
  }
  logout(){
    this.dialog.open(Logout,{
      width:'20%',
      height:'15%',
      exitAnimationDuration:'200ms',
      enterAnimationDuration:'200ms'
    })
  }
}
