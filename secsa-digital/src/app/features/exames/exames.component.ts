import { Component } from '@angular/core';
import { LayoutComponent } from '../../shared/components/layout.component';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [LayoutComponent],
  template: `
    <app-layout>
      <div header>Exames</div>
      
      <div class="bg-white rounded-lg shadow-sm p-12 text-center">
        <h2 class="text-2xl font-semibold text-slate-700">Módulo de Exames em Desenvolvimento</h2>
        <p class="text-slate-600 mt-2">Lançamento, histórico e laudos dinâmicos</p>
      </div>
    </app-layout>
  `
})
export class ExamesComponent {}
