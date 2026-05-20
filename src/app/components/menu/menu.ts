import { Component, inject, OnInit, signal } from '@angular/core';
import { UserStore } from '../../store/user.store';
import { MatIcon } from '@angular/material/icon';
import { PageStore } from '../../store/page.store';

@Component({
  selector: 'app-menu',
  imports: [MatIcon],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu implements OnInit {
  async ngOnInit(): Promise<void> {
    await this.store.Me();
  }
  menuShow = signal(true);
  store = inject(UserStore);
  pageStore = inject(PageStore);
  async logout(){
    await this.store.Logout();
    if(!this.store.isLogged() && !this.store.isError()){
      window.location.href = '/signup';
    }
  }
}
