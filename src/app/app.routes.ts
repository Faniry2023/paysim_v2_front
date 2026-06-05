import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Signin } from './pages/signin/signin';
import { loggedOutGuard } from './guards/logged-out-guard';
import { loggedInGuard } from './guards/logged-in-guard';
import { OffSim } from './pages/off-sim/off-sim';
import { Mode } from './test/mode/mode';

export const routes: Routes = [
    {
        path:'',
        redirectTo: 'home',
        pathMatch:'full'
    },
    {
        path:'home',
        component:Home,
        canActivate:[loggedInGuard]
    },
    {
        path:'signup',
        component:Login,
        canActivate:[loggedOutGuard]
    },
    {
        path:'signin',
        component:Signin,
        canActivate:[loggedOutGuard]
    },{
        path:'simulation_paysim',
        component:OffSim
    },{
        path:'mode',
        component:Mode
    }
];
