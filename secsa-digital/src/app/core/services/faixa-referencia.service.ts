import { Injectable } from '@angular/core';
import { ParametroExame, FaixaReferencia, CondicaoReferencia } from '../../data/interfaces/exame.interface';

interface DadosPaciente {
  sexo: 'M' | 'F';
  idadeAnos: number;
  idadeMeses?: number;
  idadeDias?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FaixaReferenciaService {

  /**
   * Seleciona a faixa de referência apropriada para um paciente
   */
  selecionarFaixa(parametro: ParametroExame, paciente: DadosPaciente): FaixaReferencia | null {
    // Se não tiver faixas definidas, usa min/max direto (compatibilidade)
    if (!parametro.faixasReferencia || parametro.faixasReferencia.length === 0) {
      if (parametro.min !== undefined && parametro.max !== undefined) {
        return {
          id: 'default',
          descricao: 'Padrão',
          min: parametro.min,
          max: parametro.max,
          ordem: 0
        };
      }
      return null;
    }

    // Filtrar faixas que atendem às condições do paciente
    const faixasAplicaveis = parametro.faixasReferencia.filter(faixa => {
      if (!faixa.condicao) {
        return true; // Faixa padrão sempre se aplica
      }
      return this.avaliarCondicao(faixa.condicao, paciente);
    });

    if (faixasAplicaveis.length === 0) {
      return null;
    }

    // Ordenar por prioridade (ordem crescente)
    faixasAplicaveis.sort((a, b) => a.ordem - b.ordem);

    // Retornar a primeira (maior prioridade)
    return faixasAplicaveis[0];
  }

  /**
   * Avalia se uma condição se aplica ao paciente
   */
  private avaliarCondicao(condicao: CondicaoReferencia, paciente: DadosPaciente): boolean {
    switch (condicao.tipo) {
      case 'sexo':
        return this.avaliarCondicaoSexo(condicao, paciente);
      
      case 'idade':
        return this.avaliarCondicaoIdade(condicao, paciente);
      
      case 'idade_e_sexo':
        return this.avaliarCondicaoSexo(condicao, paciente) && 
               this.avaliarCondicaoIdade(condicao, paciente);
      
      default:
        return false;
    }
  }

  /**
   * Avalia condição de sexo
   */
  private avaliarCondicaoSexo(condicao: CondicaoReferencia, paciente: DadosPaciente): boolean {
    if (!condicao.sexo) return true;
    return condicao.sexo === paciente.sexo;
  }

  /**
   * Avalia condição de idade
   */
  private avaliarCondicaoIdade(condicao: CondicaoReferencia, paciente: DadosPaciente): boolean {
    if (condicao.idadeMin === undefined && condicao.idadeMax === undefined) {
      return true;
    }

    // Converter idade do paciente para a unidade da condição
    const idadePaciente = this.converterIdade(
      paciente,
      condicao.unidadeIdade || 'anos'
    );

    const min = condicao.idadeMin ?? 0;
    const max = condicao.idadeMax ?? Infinity;

    return idadePaciente >= min && idadePaciente <= max;
  }

  /**
   * Converte idade do paciente para a unidade especificada
   */
  private converterIdade(paciente: DadosPaciente, unidade: 'anos' | 'meses' | 'dias'): number {
    switch (unidade) {
      case 'anos':
        return paciente.idadeAnos;
      
      case 'meses':
        if (paciente.idadeMeses !== undefined) {
          return paciente.idadeMeses;
        }
        return paciente.idadeAnos * 12;
      
      case 'dias':
        if (paciente.idadeDias !== undefined) {
          return paciente.idadeDias;
        }
        return paciente.idadeAnos * 365;
      
      default:
        return paciente.idadeAnos;
    }
  }

  /**
   * Calcula idade em diferentes unidades a partir da data de nascimento
   */
  calcularIdades(dataNascimento: Date, dataReferencia: Date = new Date()): DadosPaciente & { idadeAnos: number; idadeMeses: number; idadeDias: number } {
    const diffMs = dataReferencia.getTime() - dataNascimento.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMeses = Math.floor(diffDias / 30.44); // Média de dias por mês
    const diffAnos = Math.floor(diffDias / 365.25); // Considera anos bissextos

    return {
      sexo: 'M', // Será preenchido externamente
      idadeAnos: diffAnos,
      idadeMeses: diffMeses,
      idadeDias: diffDias
    };
  }

  /**
   * Formata descrição da faixa de referência
   */
  formatarDescricaoFaixa(faixa: FaixaReferencia): string {
    return `${faixa.min} - ${faixa.max}`;
  }

  /**
   * Formata descrição completa incluindo condição
   */
  formatarDescricaoCompleta(faixa: FaixaReferencia): string {
    return faixa.descricao;
  }
}
