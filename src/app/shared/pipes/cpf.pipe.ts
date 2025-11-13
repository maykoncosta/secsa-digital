import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cpf',
  standalone: true
})
export class CpfPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove tudo que não é número
    const cpf = value.replace(/\D/g, '');
    
    // Aplica a máscara
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return value;
  }
}
