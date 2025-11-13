import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cns',
  standalone: true
})
export class CnsPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const cns = value.replace(/\D/g, '');
    
    // Aplica a máscara para CNS (15 dígitos)
    if (cns.length === 15) {
      return cns.replace(/(\d{3})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    }
    
    return value;
  }
}
