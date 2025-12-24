import { Timestamp } from '@angular/fire/firestore';

export interface SchemaExame {
  id: string;
  nome: string;
  categoria: string;
  ativo: boolean;
  parametros: ParametroExame[];
}

export interface ParametroExame {
  id: string;
  label: string;
  unidade: string;
  tipo: 'number' | 'text';
  grupo: string;
  isCalculado: boolean;
  formula?: string;
}

export interface ExameRealizado {
  uid: string;
  paciente: {
    id: string;
    nome: string;
    cpf: string;
    sexo: 'M' | 'F';
    idadeNaData: number;
  };
  status: 'pendente' | 'finalizado' | 'liberado';
  resultados: Record<string, any>;
  dataColeta: Timestamp;
}
