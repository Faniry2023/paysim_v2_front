import { Component, inject, OnInit, signal } from '@angular/core';
import { HistoricalStore } from '../../../store/historical.store';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HistoricalSearchHelper } from '../../../helpers/historical-search-helper';

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
  step = signal<number>(5);
  count = signal<number>(0);
  form!:FormGroup
  fb = inject(FormBuilder);
  isSearch = signal<boolean>(false);
  historicalS = signal<HistoricalSearchHelper | null>(null);
  async ngOnInit() {
     this.form = this.fb.group({
      name_developer: [null],
      number: [null],
      reference: [null],
      reason: [null],
      price: [null],
      date: [null]
    })
    this.isSearch.set(false)
    await this.historicalStore.getAllHistorical(this.page(),this.step());
    console.log('charge ....')
    console.log(this.historicalStore.historicals())
    if(this.historicalStore.count() > this.step()){
      this.loadNext.set(true);
      var count_page = Math.floor(this.historicalStore.count() / this.step());
      var raims = this.historicalStore.count() % this.step();
      this.count.set((raims == 0)? count_page : count_page + 1)
    }
  }

  async search(){
    const historicSearch: HistoricalSearchHelper = this.form.value;
    //check if at least one value is not empty
    const hasValue = Object.values(historicSearch).some(value => 
      value !== null &&
      value !== undefined &&
      value.toString().trim() !== ''
    );
    this.loadBack.set(false)
    if(!hasValue){
      await this.ngOnInit();
      this.isSearch.set(false);
      return;
    }
    this.historicalS.set(historicSearch)
    this.historicalS.update(value => {
        if (value) {
          return {
            ...value,
            page: this.page(),
            step: this.step()
          };
        }

        return value;
      });
    this.isSearch.set(true)
    await this.historicalStore.searchHistorical(this.historicalS()!);
    if(this.historicalStore.count() > this.step()){
      this.page.set(0)
      this.loadNext.set(true);
      const count_page = Math.floor(this.historicalStore.count() / this.step());
      const raims = this.historicalStore.count() % this.step();
      this.count.set((raims == 0 )? count_page : count_page + 1)
    }else{
      this.loadNext.set(false)
      this.page.set(0)
      this.count.set(1);
    }
    if(this.historicalStore.count() == 0){
      this.count.set(0);
      this.page.set(0);
    }
  }

  async next(){
    this.loadBack.set(true);
    if(!this.isSearch()){
      this.page.set(this.page() + 1);
      if((this.count() - this.page()) == 1){
        this.loadNext.set(false);
        await this.historicalStore.getAllHistorical(this.page(), this.step());
      }else{
        await this.historicalStore.getAllHistorical(this.page(), this.step())
      }
    }else{
      this.page.set(this.page() + 1);
      if((this.count()-this.page()) == 1){
        this.loadNext.set(false);
        this.updatePage();
        await this.historicalStore.searchHistorical(this.historicalS()!);
      }else{
        this.updatePage();
        await this.historicalStore.searchHistorical(this.historicalS()!);
      }
    }


    
  }
  updatePage(){
      this.historicalS.update(value => {
        if (value) {
          return {
            ...value,
            page: this.page(),
          };
        }

        return value;
      });
  }
  async back(){
    
    this.loadNext.set(true);
    if(!this.isSearch()){
      
      if(this.page() <= 0){
        this.page.set(0);
        this.loadBack.set(false);
      }else{
        
        this.page.set(this.page() - 1)
        await this.historicalStore.getAllHistorical(this.page(), this.step());
        
        if(this.page() <= 0)
          this.loadBack.set(false)
      }
    }else{
      if(this.page() <= 0){
        this.page.set(0);
        this.updatePage();
        this.loadBack.set(false)
      }else{
        this.page.set(this.page() -1);
        this.updatePage();
        await this.historicalStore.searchHistorical(this.historicalS()!);
        if(this.page() <= 0){
          this.loadBack.set(false);
        }
      }
    }


  }
}
