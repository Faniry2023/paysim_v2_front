import { Component, inject, OnInit } from '@angular/core';
import { UserStore } from '../../store/user.store';
import { Menu } from '../../components/menu/menu';
import { PageStore } from '../../store/page.store';
import { Main } from './main/main';
import { MatDialog } from '@angular/material/dialog';
import { Logout } from '../../components/popup/logout/logout';

@Component({
  selector: 'app-home',
  imports: [Menu,Main],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home{

}
