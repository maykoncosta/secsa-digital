import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExameRealizado, ParametroExameRealizado } from '../../core/models';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  /**
   * Gera PDF do exame realizado
   */
  async gerarPdfExame(exame: ExameRealizado, parametros: ParametroExameRealizado[]): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Logo à direita
    try {
      const logoDataUrl = await this.carregarImagemComoBase64('images/logo-prefeitura.png');
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', pageWidth - 40, yPosition - 5, 25, 25);
      }
    } catch (error) {
      console.warn('Não foi possível carregar a logo:', error);
    }

    // Cabeçalho à esquerda
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Prefeitura Municipal de Riacho de Santo Antônio', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(14);
    doc.text('Secretaria de Saúde', 15, yPosition);
    yPosition += 6;

    doc.setFontSize(12);
    doc.text('Laboratório de Análises Clínicas', 15, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Policlínica Severino Mineiro da Costa', 15, yPosition);
    yPosition += 4;
    doc.text('CNES: 7956444', 15, yPosition);
    yPosition += 4;
    doc.text('Rua Principal, Centro - Riacho de Santo Antônio/PB', 15, yPosition);
    yPosition += 10;

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;

    // Título do exame
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(exame.exameNome, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Código: ${exame.codigo}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Dados do Paciente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Dados do Paciente', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${exame.pacienteNome}`, 15, yPosition);
    yPosition += 5;
    doc.text(`CPF: ${exame.pacienteCpf}`, 15, yPosition);
    
    if (exame.pacienteCns) {
      yPosition += 5;
      doc.text(`CNS: ${exame.pacienteCns}`, 15, yPosition);
    }
    yPosition += 10;

    // Informações do Exame
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informações do Exame', 15, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataColeta = this.formatarDataTimestamp(exame.dataColeta);
    doc.text(`Data da Coleta: ${dataColeta}`, 15, yPosition);
    yPosition += 5;

    if (exame.dataLiberacao) {
      const dataLiberacao = this.formatarDataTimestamp(exame.dataLiberacao);
      doc.text(`Data da Liberação: ${dataLiberacao}`, 15, yPosition);
      yPosition += 5;
    }

    doc.text(`Profissional Responsável: ${exame.profissionalNome}`, 15, yPosition);
    yPosition += 5;
    doc.text(`Status: ${exame.status.toUpperCase()}`, 15, yPosition);
    yPosition += 10;

    // Resultados - Tabela
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados', 15, yPosition);
    yPosition += 5;

    // Agrupa parâmetros por grupo
    const parametrosAgrupados = this.agruparParametros(parametros);

    parametrosAgrupados.forEach((grupo, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Título do grupo
      if (grupo.grupo !== 'Outros' && parametrosAgrupados.length > 1) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(grupo.grupo, 15, yPosition);
        yPosition += 5;
      }

      // Tabela de parâmetros
      const tableData = grupo.parametros.map(p => [
        p.nome,
        p.valor,
        p.unidade || '-',
        p.valorReferencia || '-'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Parâmetro', 'Resultado', 'Unidade', 'Valor de Referência']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 60, halign: 'center' }
        },
        margin: { left: 15, right: 15 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    });

    // Observações
    if (exame.observacoes) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Observações', 15, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const linhasObservacoes = doc.splitTextToSize(exame.observacoes, pageWidth - 30);
      doc.text(linhasObservacoes, 15, yPosition);
      yPosition += linhasObservacoes.length * 5 + 5;
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.text(
        'Atenção: Este é um documento oficial. Qualquer rasura invalidará o mesmo.',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
      
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 15,
        footerY + 5,
        { align: 'right' }
      );
      
      const dataEmissao = format(new Date(), 'dd/MM/yyyy HH:mm');
      doc.text(
        `Emitido em: ${dataEmissao}`,
        15,
        footerY + 5
      );
    }

    // Salva o PDF
    const nomeArquivo = `Exame_${exame.codigo}_${exame.pacienteNome.replace(/\s+/g, '_')}.pdf`;
    doc.save(nomeArquivo);
  }

  /**
   * Agrupa parâmetros por grupo
   */
  private agruparParametros(parametros: ParametroExameRealizado[]): { grupo: string; parametros: ParametroExameRealizado[] }[] {
    const grupos: { [key: string]: ParametroExameRealizado[] } = {};

    parametros.forEach(p => {
      const nomeGrupo = p.grupo || 'Outros';
      if (!grupos[nomeGrupo]) {
        grupos[nomeGrupo] = [];
      }
      grupos[nomeGrupo].push(p);
    });

    return Object.keys(grupos).map(grupo => ({
      grupo,
      parametros: grupos[grupo]
    }));
  }

  /**
   * Formata timestamp do Firestore
   */
  private formatarDataTimestamp(data: any): string {
    if (!data) return '-';

    if (data.toDate && typeof data.toDate === 'function') {
      return format(data.toDate(), 'dd/MM/yyyy HH:mm');
    }

    const d = typeof data === 'string' ? new Date(data) : data;
    return format(d, 'dd/MM/yyyy HH:mm');
  }



  /**
   * Carrega imagem e converte para base64
   */
  private carregarImagemComoBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível obter contexto do canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Erro ao carregar imagem'));
      };
      
      img.src = url;
    });
  }
}
