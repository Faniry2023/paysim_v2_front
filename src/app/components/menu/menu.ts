import { Component, inject, OnInit, signal } from '@angular/core';
import { UserStore } from '../../store/user.store';
import { MatIcon } from '@angular/material/icon';
import { PageStore } from '../../store/page.store';
import { DeveloperStore } from '../../store/developer.store';
import { MatDialog } from '@angular/material/dialog';
import { Logout } from '../popup/logout/logout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [MatIcon],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  private dialog = inject(MatDialog);
  async ngOnInit(): Promise<void> {
    await this.store.Me();
    await this.developerStore.GetDeveloer();
  }
  router = inject(Router);
  menuShow = signal(true);
  store = inject(UserStore);
  pageStore = inject(PageStore);
  developerStore = inject(DeveloperStore);
  async logout(){
    await this.store.Logout();
    if(!this.store.isLogged() && !this.store.isError()){
      window.location.href = '/signup';
    }
  }
  openDialogLogout(){
    this.dialog.open(Logout,{
      width:'20%',
      height:'15%',
      exitAnimationDuration:'200ms',
      enterAnimationDuration:'200ms'
    })
  }
  goToDoc(){
    this.router.navigate(['/documentation']);
  }
  
}
