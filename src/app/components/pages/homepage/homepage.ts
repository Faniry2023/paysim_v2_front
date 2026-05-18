import { Component, inject, OnInit } from '@angular/core';
import { UserStore } from '../../../store/user.store';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit{
  async ngOnInit() {
    await this.userStore.Me();
  }

  userStore = inject(UserStore);

}
