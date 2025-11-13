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
