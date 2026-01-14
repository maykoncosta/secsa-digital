import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCns',
  standalone: true
})
export class MaskCnsPipe implements PipeTransform {
  transform(cns: string | null | undefined): string {
    if (!cns) return '';
    
    // Remover formatação
    const cnsLimpo = cns.replace(/\D/g, '');
    
    if (cnsLimpo.length !== 15) return cns;
    
    // Mascarar: ***********4321 (mostra apenas os 4 últimos dígitos)
    const ultimosDigitos = cnsLimpo.slice(-4);
    return `***********${ultimosDigitos}`;
  }
}
