import { Timestamp } from '@angular/fire/firestore';

export type PerfilUsuario = 'admin' | 'bioquimico' | 'paciente';

export type StatusExame = 'pendente' | 'liberado' | 'cancelado';

export interface Usuario {
  uid: string;
  nome: string;
  cpf: string;
  cns?: string; // Cartão Nacional de Saúde
  sexo: 'M' | 'F'; // Masculino ou Feminino
  dataNascimento: Date;
  telefone: string;
  email?: string; // Opcional
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  perfil: PerfilUsuario;
  primeiroAcesso: boolean;
  ativo: boolean;
  criadoEm: Date | Timestamp;
  atualizadoEm: Date | Timestamp;
}

export interface Exame {
  id?: string;
  codigo: string; // Gerado automaticamente pelo Cloud Function
  pacienteId: string;
  pacienteNome: string;
  pacienteCpf: string;
  pacienteCns?: string;
  pacienteDataNascimento: Date;
  tipoExame: 'hemograma' | 'urina' | 'fezes';
  status: StatusExame;
  dataColeta: Date;
  dataLiberacao?: Date;
  bioquimicoId?: string;
  bioquimicoNome?: string;
  observacoes?: string;
  parametros: ParametroExame[];
  criadoEm: Date | Timestamp;
  atualizadoEm: Date | Timestamp;
  criadoPor: string; // UID do usuário que criou
  atualizadoPor: string; // UID do último usuário que atualizou
}

export interface ParametroExame {
  nome: string;
  valor: number | string;
  unidade: string;
  valorReferencia: string;
  alterado: boolean; // Se está fora do valor de referência
  observacao?: string;
}

export interface ValorReferencia {
  id?: string;
  tipoExame: 'hemograma' | 'urina' | 'fezes';
  parametro: string;
  faixaEtaria?: {
    min?: number; // idade mínima em anos
    max?: number; // idade máxima em anos
  };
  sexo?: 'M' | 'F' | 'ambos';
  valorMinimo?: number;
  valorMaximo?: number;
  unidade: string;
  observacao?: string;
  ativo: boolean;
  criadoEm: Date | Timestamp;
  atualizadoEm: Date | Timestamp;
}

export interface Auditoria {
  id?: string;
  entidade: string; // Nome da coleção (exames, usuarios, etc)
  entidadeId: string; // ID do documento
  acao: 'criar' | 'atualizar' | 'excluir' | 'login' | 'logout' | 'alterar_senha';
  usuarioId: string;
  usuarioNome: string;
  timestamp: Date | Timestamp;
  dadosAnteriores?: any;
  dadosNovos?: any;
  ip?: string;
  userAgent?: string;
}

export interface Notificacao {
  id?: string;
  destinatarioId: string; // UID do usuário
  tipo: 'exame_liberado' | 'senha_alterada' | 'novo_usuario' | 'sistema';
  titulo: string;
  mensagem: string;
  lida: boolean;
  exameId?: string; // Se for notificação de exame
  criadoEm: Date | Timestamp;
  lidoEm?: Date | Timestamp;
}

export interface Configuracao {
  id?: string;
  chave: string; // Identificador único da configuração
  valor: any;
  descricao: string;
  tipo: 'string' | 'number' | 'boolean' | 'object' | 'array';
  editavel: boolean; // Se pode ser editada pela interface
  atualizadoEm: Date | Timestamp;
  atualizadoPor: string;
}

// ==================== NOVA ESTRUTURA DE EXAMES ====================

export interface TipoExame {
  uid: string;
  nome: string;
  codigo: string; // Ex: "HEM", "URI", "FEZ"
  categoria: string; // Ex: "hematologia", "urinálise", "parasitologia"
  ativo: boolean;
  ordem: number; // Para ordenação na UI
  dataCriacao: Date | Timestamp;
  dataAtualizacao: Date | Timestamp;
}

export interface ParametroTipoExame {
  uid: string;
  nome: string;
  unidade: string;
  tipo: 'numerico' | 'texto' | 'selecao';
  grupo?: string; // Ex: "eritrograma", "leucograma", "plaquetas"
  ordem: number;
  obrigatorio: boolean;
  opcoes?: string[]; // Para tipo "selecao"
}

export interface ValorReferenciaParametro {
  uid: string;
  sexo: 'M' | 'F' | 'ambos';
  idadeMin?: number; // Em anos
  idadeMax?: number; // Em anos
  valorMin?: number; // Para valores numéricos
  valorMax?: number; // Para valores numéricos
  valorEsperado?: string; // Para valores não-numéricos
  ativo: boolean;
}

export interface ExameRealizado {
  uid: string;
  codigo: string; // Código único do exame realizado (ex: "HEM-2024-00001")
  pacienteId: string;
  pacienteNome: string; // Desnormalizado
  pacienteCpf: string; // Desnormalizado
  pacienteCns?: string; // Desnormalizado
  pacienteDataNascimento: Date; // Desnormalizado
  exameId: string; // Referência ao TipoExame
  exameNome: string; // Desnormalizado
  dataColeta: Date | Timestamp;
  dataResultado?: Date | Timestamp;
  dataLiberacao?: Date | Timestamp;
  status: 'pendente' | 'finalizado' | 'liberado' | 'cancelado';
  observacoes?: string;
  profissionalId: string;
  profissionalNome: string; // Desnormalizado
  criadoEm: Date | Timestamp;
  atualizadoEm: Date | Timestamp;
}

export interface ParametroExameRealizado {
  uid: string;
  nome: string; // Desnormalizado
  valor: any;
  unidade: string; // Desnormalizado
  valorReferencia: string; // Desnormalizado (ex: "4.5 - 6.0")
  interpretacao: 'normal' | 'alterado' | 'critico';
  grupo?: string; // Desnormalizado
}
