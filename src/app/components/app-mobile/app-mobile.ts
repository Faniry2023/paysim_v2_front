import { Component } from '@angular/core';

@Component({
  selector: 'app-app-mobile',
  imports: [],
  templateUrl: './app-mobile.html',
  styleUrl: './app-mobile.css',
})
export class AppMobile {
  downApp(){
    //window.location.href = "https://localhost:7110/download/appmobile"
    window.location.href = "https://paysim.runasp.net/download/appmobile"
  }
}
