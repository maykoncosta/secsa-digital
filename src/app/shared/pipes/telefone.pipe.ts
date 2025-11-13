import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefone',
  standalone: true
})
export class TelefonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const telefone = value.replace(/\D/g, '');
    
    // Aplica a máscara para celular (11 dígitos)
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    // Aplica a máscara para telefone fixo (10 dígitos)
    if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return value;
  }
}
