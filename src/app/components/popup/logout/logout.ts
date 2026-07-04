import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserStore } from '../../../store/user.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  constructor(private dialogRef:MatDialogRef<Logout>, @Inject(MAT_DIALOG_DATA) public data:any){}
  store = inject(UserStore);
  router = inject(Router);
  async logout(){
    await this.store.Logout();
    if(!this.store.isLogged() && !this.store.isError()){
      this.dialogRef.close();
      this.router.navigate(["/signup"], {
        replaceUrl:true
      })
    }
  }
  cancel(){
    this.dialogRef.close();
  }
}
