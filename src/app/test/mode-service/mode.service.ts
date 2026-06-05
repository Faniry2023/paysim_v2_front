import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark'
@Injectable({
  providedIn: 'root',
})
export class ModeService {
  readonly theme = signal<Theme>(this.getSavedTheme())
  
  constructor(){
    effect(() =>{
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('theme',this.theme());
    })
  }

  toggle(){
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  private getSavedTheme():Theme{
    const saved = localStorage.getItem('theme') as Theme;
    if(saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

