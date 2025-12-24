import { Timestamp } from '@angular/fire/firestore';

export interface Paciente {
  id: string;
  numeroProntuario: string;
  nomeCompleto: string;
  dataNascimento: Date;
  cpf?: string;
  cns?: string;
  email?: string;
  telefone: string;
  genero: 'M' | 'F' | 'Outro' | 'NaoInformado';
  endereco?: Endereco;
  responsavelLegal?: ResponsavelLegal;
  status: 'ativo' | 'inativo';
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface ResponsavelLegal {
  nome: string;
  cpf: string;
  parentesco: string;
}

export type StatusPaciente = 'ativo' | 'inativo';
export type Genero = 'M' | 'F' | 'Outro' | 'NaoInformado';
