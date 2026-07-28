import { Component, inject, signal } from '@angular/core';
import { HistoricalSmsStore } from '../../../store/historical-sms.store';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HistoricalSmsSearchHelper } from '../../../helpers/historical-sms-search-helper';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-historical-admin',
  imports: [DatePipe,ReactiveFormsModule],
  templateUrl: './historical-admin.html',
  styleUrl: './historical-admin.css',
})
export class HistoricalAdmin {
  historicalSmsStore = inject(HistoricalSmsStore);
  page = signal<number>(0);
  loadNext = signal<boolean>(false);
  loadBack = signal<boolean>(false);
  step = signal<number>(5);
  count = signal<number>(0);
  form!:FormGroup
  fb = inject(FormBuilder);
  isSearch = signal<boolean>(false);
  historicalS = signal<HistoricalSmsSearchHelper | null>(null);
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
    await this.historicalSmsStore.getAllHistorical(this.page(),this.step());
    console.log('charge ....')
    if(this.historicalSmsStore.count() > this.step()){
      this.loadNext.set(true);
      var count_page = Math.floor(this.historicalSmsStore.count() / this.step());
      var raims = this.historicalSmsStore.count() % this.step();
      this.count.set((raims == 0)? count_page : count_page + 1)
    }
  }

  async search(){
    const historicSearch: HistoricalSmsSearchHelper = this.form.value;
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
    await this.historicalSmsStore.searchHistorical(this.historicalS()!);
    if(this.historicalSmsStore.count() > this.step()){
      this.page.set(0)
      this.loadNext.set(true);
      const count_page = Math.floor(this.historicalSmsStore.count() / this.step());
      const raims = this.historicalSmsStore.count() % this.step();
      this.count.set((raims == 0 )? count_page : count_page + 1)
    }else{
      this.loadNext.set(false)
      this.page.set(0)
      this.count.set(1);
    }
    if(this.historicalSmsStore.count() == 0){
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
        await this.historicalSmsStore.getAllHistorical(this.page(), this.step());
      }else{
        await this.historicalSmsStore.getAllHistorical(this.page(), this.step())
      }
    }else{
      this.page.set(this.page() + 1);
      if((this.count()-this.page()) == 1){
        this.loadNext.set(false);
        this.updatePage();
        await this.historicalSmsStore.searchHistorical(this.historicalS()!);
      }else{
        this.updatePage();
        await this.historicalSmsStore.searchHistorical(this.historicalS()!);
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
        await this.historicalSmsStore.getAllHistorical(this.page(), this.step());
        
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
        await this.historicalSmsStore.searchHistorical(this.historicalS()!);
        if(this.page() <= 0){
          this.loadBack.set(false);
        }
      }
    }
  }
}
