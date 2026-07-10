import { Component, inject, OnInit, signal } from '@angular/core';
import { HistoricalStore } from '../../../store/historical.store';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-historical',
  imports: [DatePipe, MatIcon, ReactiveFormsModule],
  templateUrl: './historical.html',
  styleUrl: './historical.css',
})
export class Historical implements OnInit{
  historicalStore = inject(HistoricalStore);
  page = signal<number>(0);
  loadNext = signal<boolean>(false);
  loadBack = signal<boolean>(false);
  step = signal<number>(2);
  count = signal<number>(0);
  form!:FormGroup
  fb = inject(FormBuilder);
  async ngOnInit() {
     this.form = this.fb.group({
      name_developer: [null],
      number: [null],
      reference: [null],
      reason: [null],
      price: [null],
      date: [null]
    })
    
    await this.historicalStore.getAllHistorical(this.page(),this.step());
    console.log('charge ....')
    console.log(this.historicalStore.historicals())
    if(this.historicalStore.count() > 2){
      this.loadNext.set(true);
      var count_page = Math.floor(this.historicalStore.count() / this.step());
      var raims = this.historicalStore.count() % this.step();
      this.count.set((raims == 0)? count_page : count_page + 1)
    }

   
  }

  async search(){
    
  }

  async next(){
    this.loadBack.set(true);
    this.page.set(this.page() + 1);
    if((this.count() - this.page()) == 1){
      this.loadNext.set(false);
      await this.historicalStore.getAllHistorical(this.page(), this.step());
    }else{
      await this.historicalStore.getAllHistorical(this.page(), this.step())
    }
    
  }
  async back(){
    this.loadNext.set(true);
    this.page.set(this.page() - 1)
    if(this.page() <= 0){
      this.page.set(0);
      this.loadBack.set(false);
    }else{
      await this.historicalStore.getAllHistorical(this.page(), this.step());
    }

  }
}
