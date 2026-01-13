import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { ExameRealizado } from '../../data/interfaces/exame.interface';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaService {

  /**
   * Gera PDF com etiquetas para os exames pendentes
   * Layout: 2 colunas x 7 linhas por página (etiquetas 99.1 x 38.1mm)
   */
  gerarEtiquetasPendentes(exames: ExameRealizado[]): void {
    if (exames.length === 0) {
      return;
    }

    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm'
    });

    // Configurações das etiquetas (padrão A4 2x7 - tipo Pimaco A4250)
    const etiquetaLargura = 99.1;
    const etiquetaAltura = 38.1;
    const margemEsquerda = 5.8;
    const margemTopo = 12.7;
    const espacamentoHorizontal = 2.5;
    const espacamentoVertical = 0;
    
    const colunas = 2;
    const linhas = 7;
    const etiquetasPorPagina = colunas * linhas;

    let paginaAtual = 0;
    
    exames.forEach((exame, index) => {
      const posicaoNaPagina = index % etiquetasPorPagina;
      
      // Nova página quando necessário
      if (index > 0 && posicaoNaPagina === 0) {
        doc.addPage();
        paginaAtual++;
      }
      
      const linha = Math.floor(posicaoNaPagina / colunas);
      const coluna = posicaoNaPagina % colunas;
      
      const x = margemEsquerda + (coluna * (etiquetaLargura + espacamentoHorizontal));
      const y = margemTopo + (linha * (etiquetaAltura + espacamentoVertical));
      
      this.desenharEtiqueta(doc, exame, x, y, etiquetaLargura, etiquetaAltura);
    });

    // Salvar PDF
    const dataAtual = new Date().toISOString().split('T')[0];
    doc.save(`etiquetas-exames-pendentes-${dataAtual}.pdf`);
  }

  private desenharEtiqueta(
    doc: jsPDF, 
    exame: ExameRealizado, 
    x: number, 
    y: number, 
    largura: number, 
    altura: number
  ): void {
    const padding = 3;
    const xInicio = x + padding;
    let yAtual = y + padding + 4;

    // Borda (opcional - descomente se quiser ver os limites)
    // doc.setDrawColor(200, 200, 200);
    // doc.rect(x, y, largura, altura);

    // Nome do Paciente (negrito, maior)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const nomePaciente = this.truncarTexto(doc, exame.paciente.nome, largura - 2 * padding);
    doc.text(nomePaciente, xInicio, yAtual);
    yAtual += 5;

    // Tipo de Exame
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const tipoExame = this.truncarTexto(doc, exame.schemaNome, largura - 2 * padding);
    doc.text(tipoExame, xInicio, yAtual);
    yAtual += 5;

    // Dados do paciente em fonte menor
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    
    // CPF
    doc.text(`CPF: ${this.formatarCPF(exame.paciente.cpf)}`, xInicio, yAtual);
    yAtual += 3.5;

    // Data de Nascimento
    const dataNasc = this.formatarData(exame.paciente.dataNascimento);
    doc.text(`Nascimento: ${dataNasc}`, xInicio, yAtual);
    yAtual += 3.5;

    // Data da Coleta
    const dataColeta = this.formatarData(exame.dataColeta);
    doc.text(`Data Coleta: ${dataColeta}`, xInicio, yAtual);
    yAtual += 3.5;

    // UID do Exame (código de barras manual/referência)
    doc.setFontSize(6);
    doc.setFont('courier', 'normal');
    const uidAbreviado = exame.uid?.substring(0, 20) || 'N/A';
    doc.text(`ID: ${uidAbreviado}`, xInicio, yAtual);
  }

  private truncarTexto(doc: jsPDF, texto: string, larguraMaxima: number): string {
    const larguraTexto = doc.getTextWidth(texto);
    
    if (larguraTexto <= larguraMaxima) {
      return texto;
    }
    
    // Truncar e adicionar reticências
    let textoTruncado = texto;
    while (doc.getTextWidth(textoTruncado + '...') > larguraMaxima && textoTruncado.length > 0) {
      textoTruncado = textoTruncado.slice(0, -1);
    }
    
    return textoTruncado + '...';
  }

  private formatarCPF(cpf: string): string {
    const apenasNumeros = cpf.replace(/\D/g, '');
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  }

  private formatarData(data: any): string {
    if (!data) return 'N/A';
    
    let dataObj: Date;
    
    if (data.toDate) {
      dataObj = data.toDate();
    } else if (data instanceof Date) {
      dataObj = data;
    } else if (typeof data === 'string') {
      dataObj = new Date(data);
    } else {
      return 'N/A';
    }
    
    const dia = String(dataObj.getDate()).padStart(2, '0');
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const ano = dataObj.getFullYear();
    
    return `${dia}/${mes}/${ano}`;
  }
}
