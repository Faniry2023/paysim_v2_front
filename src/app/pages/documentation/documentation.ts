import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentation',
  imports: [CommonModule],
  templateUrl: './documentation.html',
  styleUrl: './documentation.css',
})
export class Documentation {
  router = inject(Router);
  activeSection = 'intro';

  readonly sections = ['intro', 'auth', 'setup', 'qrcode', 'hub', 'result', 'endpoints', 'models', 'errors'];

  readonly navLinks = [
    { id: 'intro',     label: 'Introduction',      group: 'Démarrage' },
    { id: 'auth',      label: 'Authentification',   group: '' },
    { id: 'setup',     label: '1. Setup paiement',  group: 'Intégration' },
    { id: 'qrcode',    label: '2. Afficher le QR',  group: '' },
    { id: 'hub',       label: '3. Connexion Hub',   group: '' },
    { id: 'result',    label: '4. Résultat',        group: '' },
    { id: 'endpoints', label: 'Endpoints',          group: 'Référence' },
    { id: 'models',    label: 'Modèles',            group: '' },
    { id: 'errors',    label: 'Erreurs',            group: '' },
  ];

  copyStatus: { [key: string]: boolean } = {};

  @HostListener('window:scroll')
  onScroll(): void {
    let current = 'intro';
    for (const id of this.sections) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 120) {
        current = id;
      }
    }
    this.activeSection = current;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  copyCode(blockId: string): void {
    const el = document.getElementById(blockId);
    if (!el) return;
    const text = el.innerText;
    navigator.clipboard.writeText(text);
    this.copyStatus[blockId] = true;
    setTimeout(() => this.copyStatus[blockId] = false, 2000);
  }
  getCopyLabel(blockId: string): string {
    return this.copyStatus[blockId] ? 'Copie OK' : 'Copier';
}
backToDashboard(){
  this.router.navigate(['/home']);
}
}
