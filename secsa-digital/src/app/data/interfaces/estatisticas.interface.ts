export interface EstatisticasGeral {
  totalExames: number;
  exames_pendente: number;
  exames_finalizado: number;
  exames_liberado: number;
  examesHoje: number;
  totalPacientes: number;
  ultimaAtualizacao?: any;
}

export interface TopExame {
  id: string;
  nome: string;
  quantidade: number;
}
