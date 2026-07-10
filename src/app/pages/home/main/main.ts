import { Component, inject } from '@angular/core';
import { OffSim } from '../../off-sim/off-sim';
import { Simulation } from '../../../components/pages/simulation/simulation';
import { Developer } from '../../../components/pages/developer/developer';
import { Project } from '../../../components/pages/project/project';
import { UserStore } from '../../../store/user.store';
import { PageStore } from '../../../store/page.store';
import { AppMobile } from '../../../components/app-mobile/app-mobile';
import { Historical } from '../../../components/pages/historical/historical';

@Component({
  selector: 'app-main',
  imports: [Simulation,Developer,Project,AppMobile,Historical],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  pageStore = inject(PageStore);
  store = inject(UserStore);
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
      case 'app_mobile':
        this.setPage('app_mobile');
        break;
      case 'historical':
        this.setPage('historical');
        break;
      default:
        this.setPage('Home');
        break;
    }
  }


  setPage(page: 'Home' | 'Sim' | 'Developer' | 'Project' | 'app_mobile' | 'historical'){
    this.pageStore.setPageState(page);
  }
}
