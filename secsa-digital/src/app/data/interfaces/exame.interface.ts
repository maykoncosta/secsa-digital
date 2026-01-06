import { Timestamp } from '@angular/fire/firestore';

/**
 * Schema de Exame - Template configurável para tipos de exame
 */
export interface SchemaExame {
  id: string;
  nome: string; // Ex: "Hemograma Completo"
  categoria: string; // Ex: "Hematologia"
  ativo: boolean;
  parametros: ParametroExame[];
  observacoes?: string;
  
  // Metadados
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  criadoPor: string; // uid do usuário
}

/**
 * Condição para aplicação de faixa de referência
 */
export interface CondicaoReferencia {
  tipo: 'idade' | 'sexo' | 'idade_e_sexo';
  
  // Para tipo 'idade' ou 'idade_e_sexo'
  idadeMin?: number; // Em anos
  idadeMax?: number; // Em anos
  unidadeIdade?: 'anos' | 'meses' | 'dias';
  
  // Para tipo 'sexo' ou 'idade_e_sexo'
  sexo?: 'M' | 'F';
}

/**
 * Faixa de referência com condição
 */
export interface FaixaReferencia {
  id: string; // ID único da faixa
  descricao: string; // Ex: "Homens adultos", "Crianças 0-6 meses"
  min: number;
  max: number;
  condicao?: CondicaoReferencia; // Se não tiver condição, é o padrão
  ordem: number; // Ordem de prioridade (menor = maior prioridade)
}

/**
 * Parâmetro de um Schema de Exame
 */
export interface ParametroExame {
  id: string; // Ex: "hemoglobina"
  label: string; // Ex: "Hemoglobina"
  unidade: string; // Ex: "g/dL"
  tipo: 'number' | 'text' | 'boolean' | 'select';
  obrigatorio: boolean;
  grupo?: string; // Ex: "Série Vermelha"
  
  // Valores calculados
  isCalculado: boolean;
  formula?: string; // Ex: "colesterolTotal - hdl - (triglicerideos / 5)"
  
  // Faixas de referência (suporta múltiplas condições)
  faixasReferencia?: FaixaReferencia[];
  
  // Valores de referência simples (deprecated, mantido para compatibilidade)
  min?: number;
  max?: number;
  
  // Para tipo 'select'
  opcoes?: string[];
}

/**
 * Exame Realizado - Instância de um exame com resultados
 */
export interface ExameRealizado {
  uid: string; // ID único do exame realizado
  
  // Referências
  schemaId: string; // ID do schema de exame
  schemaNome: string; // Snapshot para histórico
  pacienteId: string;
  
  // Dados do paciente (snapshot)
  paciente: {
    id: string;
    nome: string;
    cpf: string;
    sexo: 'M' | 'F';
    dataNascimento: Timestamp;
    idadeNaData: number; // Idade exata na data da coleta
  };
  
  // Processo
  status: 'pendente' | 'finalizado' | 'liberado';
  dataColeta: Timestamp;
  dataCadastro: Timestamp;
  dataFinalizacao?: Timestamp;
  dataLiberacao?: Timestamp;
  
  // Resultados
  resultados: Record<string, ResultadoParametro>;
  
  // Responsáveis
  cadastradoPor: string; // uid
  finalizadoPor?: string; // uid (técnico)
  liberadoPor?: string; // uid (responsável técnico)
  
  // Auditoria
  historicoEdicoes?: HistoricoEdicao[];
  
  // Observações
  observacoesTecnicas?: string;
  observacoesGrupos?: Record<string, string>; // Observações por grupo de parâmetros
}

/**
 * Resultado de um parâmetro específico
 */
export interface ResultadoParametro {
  valor: any; // number | string | boolean
  unidade: string;
}

/**
 * Histórico de edições de um exame
 */
export interface HistoricoEdicao {
  usuario: string;
  dataHora: Timestamp;
  campoAlterado: string;
  valorAnterior: any;
  valorNovo: any;
}

/**
 * Valor de Referência para parâmetros
 */
export interface ValorReferencia {
  id: string;
  schemaId: string;
  parametroId: string;
  
  // Condições de aplicação
  condicoes: {
    sexo?: 'M' | 'F';
    idadeMin?: number;
    idadeMax?: number;
    gestante?: boolean;
    condicaoEspecial?: string;
  };
  
  // Faixa
  tipo: 'numerico' | 'qualitativo';
  
  // Para valores numéricos
  min?: number;
  max?: number;
  unidade?: string;
  
  // Para valores qualitativos
  valorEsperado?: string; // "Negativo", "Ausente"
  
  // Metadados
  fonte?: string; // "MS", "SBPC", "Fabricante"
  atualizadoEm: Timestamp;
}
