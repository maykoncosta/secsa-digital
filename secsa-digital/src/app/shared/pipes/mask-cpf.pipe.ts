import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCpf',
  standalone: true
})
export class MaskCpfPipe implements PipeTransform {
  transform(cpf: string | null | undefined): string {
    if (!cpf) return '';
    
    // Remover formatação
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (cpfLimpo.length !== 11) return cpf;
    
    // Mascarar: ***.***789-01 (mostra apenas os 5 últimos dígitos)
    const ultimosDigitos = cpfLimpo.slice(-5);
    return `***.***${ultimosDigitos.slice(0, 3)}-${ultimosDigitos.slice(3)}`;
  }
}
