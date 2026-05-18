import { Component, inject, OnInit } from '@angular/core';
import { UserStore } from '../../store/user.store';
import { Menu } from '../../components/menu/menu';
import { Homepage } from '../../components/pages/homepage/homepage';
import { Developer } from '../../components/pages/developer/developer';
import { Project } from '../../components/pages/project/project';
import { PageStore } from '../../store/page.store';
import { Simulation } from '../../components/pages/simulation/simulation';
import { SimTest } from '../../test/sim-test/sim-test';

@Component({
  selector: 'app-home',
  imports: [Menu,Homepage,Developer,Project,Simulation,SimTest],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{
  ngOnInit() {
    const page = localStorage.getItem('page');
    switch(page){
      case 'Sim':
        this.setPage('Sim');
        break;
      case 'Developer':
        this.setPage('Developer');
        break;
      case 'Project':
        this.setPage('Project');
        break;
      default:
        this.setPage('Home');
        break;
    }
  }

  store = inject(UserStore);
  pageStore = inject(PageStore);
  setPage(page: 'Home' | 'Sim' | 'Developer' | 'Project'){
    this.pageStore.setPageState(page);
  }
  async logout(){
    await this.store.Logout();
    if(!this.store.isLogged() && !this.store.isError()){
      window.location.href = '/signup';
    }
  }
}
