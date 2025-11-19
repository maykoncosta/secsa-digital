import { Injectable, inject } from '@angular/core';
import { Observable, map, from, switchMap } from 'rxjs';
import { FirestoreService, QueryOptions } from '../../../core/services/firestore.service';
import { Usuario } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private firestoreService = inject(FirestoreService);
  private readonly COLLECTION = 'usuarios';

  /**
   * Criar paciente
   */
  criarPaciente(paciente: Omit<Usuario, 'uid' | 'criadoEm' | 'atualizadoEm'>): Observable<string> {
    const agora = new Date();
    const novoPaciente: Partial<Usuario> = {
      ...paciente,
      perfil: 'paciente',
      primeiroAcesso: true,
      ativo: true,
      criadoEm: agora,
      atualizadoEm: agora
    };

    return this.firestoreService.create<Usuario>(this.COLLECTION, novoPaciente);
  }

  /**
   * Buscar paciente por ID
   */
  buscarPorId(id: string): Observable<Usuario | null> {
    return this.firestoreService.getById<Usuario>(this.COLLECTION, id);
  }

  /**
   * Buscar paciente por CPF
   */
  buscarPorCpf(cpf: string): Observable<Usuario | null> {
    // Remove formatação do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    const queryOptions: QueryOptions[] = [
      { field: 'perfil', operator: '==', value: 'paciente' }
    ];

    // Como não podemos buscar por substring no Firestore,
    // buscamos todos os pacientes e filtramos no cliente
    return this.firestoreService.query<Usuario>(this.COLLECTION, queryOptions).pipe(
      map(pacientes => {
        const encontrado = pacientes.find(p => 
          p.cpf.replace(/\D/g, '') === cpfLimpo
        );
        return encontrado || null;
      })
    );
  }

  /**
   * Buscar paciente por CNS
   */
  buscarPorCns(cns: string): Observable<Usuario | null> {
    // Remove formatação do CNS
    const cnsLimpo = cns.replace(/\D/g, '');
    
    const queryOptions: QueryOptions[] = [
      { field: 'perfil', operator: '==', value: 'paciente' }
    ];

    // Como não podemos buscar por substring no Firestore,
    // buscamos todos os pacientes e filtramos no cliente
    return this.firestoreService.query<Usuario>(this.COLLECTION, queryOptions).pipe(
      map(pacientes => {
        const encontrado = pacientes.find(p => 
          p.cns && p.cns.replace(/\D/g, '') === cnsLimpo
        );
        return encontrado || null;
      })
    );
  }

  /**
   * Verificar se CPF já existe
   */
  cpfExiste(cpf: string, excluirId?: string): Observable<boolean> {
    return this.buscarPorCpf(cpf).pipe(
      map(paciente => {
        if (!paciente) return false;
        if (excluirId && paciente.uid === excluirId) return false;
        return true;
      })
    );
  }

  /**
   * Verificar se CNS já existe
   */
  cnsExiste(cns: string, excluirId?: string): Observable<boolean> {
    return this.buscarPorCns(cns).pipe(
      map(paciente => {
        if (!paciente) return false;
        if (excluirId && paciente.uid === excluirId) return false;
        return true;
      })
    );
  }

  /**
   * Atualizar paciente
   */
  atualizarPaciente(id: string, dados: Partial<Usuario>): Observable<void> {
    const dadosAtualizacao = {
      ...dados,
      atualizadoEm: new Date()
    };

    return this.firestoreService.update<Usuario>(this.COLLECTION, id, dadosAtualizacao);
  }

  /**
   * Listar todos os pacientes
   */
  listarPacientes(): Observable<Usuario[]> {
    const queryOptions: QueryOptions[] = [
      { field: 'perfil', operator: '==', value: 'paciente' },
      { field: 'ativo', operator: '==', value: true }
    ];

    return this.firestoreService.query<Usuario>(
      this.COLLECTION,
      queryOptions,
      { field: 'nome', direction: 'asc' }
    );
  }

  /**
   * Buscar pacientes por nome (parcial)
   */
  buscarPorNome(nome: string): Observable<Usuario[]> {
    // Busca todos os pacientes ativos e filtra no cliente
    // (Firestore não tem busca por substring nativa)
    const queryOptions: QueryOptions[] = [
      { field: 'perfil', operator: '==', value: 'paciente' },
      { field: 'ativo', operator: '==', value: true }
    ];

    return this.firestoreService.query<Usuario>(
      this.COLLECTION,
      queryOptions,
      { field: 'nome', direction: 'asc' }
    ).pipe(
      map(pacientes => 
        pacientes.filter(p => 
          p.nome.toLowerCase().includes(nome.toLowerCase())
        )
      )
    );
  }

  /**
   * Buscar pacientes por termo (nome, CPF ou CNS)
   */
  buscarPacientes(termo: string): Observable<Usuario[]> {
    termo = termo.trim();
    
    // Remove formatação de CPF/CNS
    const termoLimpo = termo.replace(/\D/g, '');
    
    const queryOptions: QueryOptions[] = [
      { field: 'perfil', operator: '==', value: 'paciente' },
      { field: 'ativo', operator: '==', value: true }
    ];

    return this.firestoreService.query<Usuario>(
      this.COLLECTION,
      queryOptions,
      { field: 'nome', direction: 'asc' }
    ).pipe(
      map(pacientes => 
        pacientes.filter(p => {
          // Busca por nome
          if (p.nome.toLowerCase().includes(termo.toLowerCase())) {
            return true;
          }
          
          // Busca por CPF
          if (termoLimpo && p.cpf.replace(/\D/g, '').includes(termoLimpo)) {
            return true;
          }
          
          // Busca por CNS
          if (termoLimpo && p.cns && p.cns.replace(/\D/g, '').includes(termoLimpo)) {
            return true;
          }
          
          return false;
        })
      )
    );
  }

  /**
   * Desativar paciente
   */
  desativarPaciente(id: string): Observable<void> {
    return this.atualizarPaciente(id, { ativo: false });
  }

  /**
   * Reativar paciente
   */
  reativarPaciente(id: string): Observable<void> {
    return this.atualizarPaciente(id, { ativo: true });
  }

  /**
   * Validar CPF (algoritmo oficial)
   */
  validarCpf(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Valida primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;

    if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;

    // Valida segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;

    return digitoVerificador2 === parseInt(cpf.charAt(10));
  }

  /**
   * Validar CNS (algoritmo oficial)
   */
  validarCns(cns: string): boolean {
    cns = cns.replace(/\D/g, '');

    if (cns.length !== 15) return false;

    // CNS que começa com 1 ou 2
    if (cns.charAt(0) === '1' || cns.charAt(0) === '2') {
      let soma = 0;
      for (let i = 0; i < 15; i++) {
        soma += parseInt(cns.charAt(i)) * (15 - i);
      }
      return soma % 11 === 0;
    }

    // CNS que começa com 7, 8 ou 9
    if (cns.charAt(0) === '7' || cns.charAt(0) === '8' || cns.charAt(0) === '9') {
      let soma = 0;
      for (let i = 0; i < 15; i++) {
        soma += parseInt(cns.charAt(i)) * (15 - i);
      }
      return soma % 11 === 0;
    }

    return false;
  }

  /**
   * Formatar data de nascimento para senha padrão (DDMMAAAA)
   */
  gerarSenhaPadrao(dataNascimento: Date): string {
    const dia = dataNascimento.getDate().toString().padStart(2, '0');
    const mes = (dataNascimento.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataNascimento.getFullYear().toString();
    return `${dia}${mes}${ano}`;
  }
}
