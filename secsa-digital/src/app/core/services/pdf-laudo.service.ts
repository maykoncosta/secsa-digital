import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExameRealizado, SchemaExame, FaixaReferencia } from '../../data/interfaces/exame.interface';
import { FaixaReferenciaService } from './faixa-referencia.service';

@Injectable({
  providedIn: 'root'
})
export class PdfLaudoService {
  private faixaReferenciaService = inject(FaixaReferenciaService);

  gerarLaudo(exame: ExameRealizado, schema: SchemaExame): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;

    // Calcular faixas de referência para o paciente
    const faixasPorParametro = this.calcularFaixasPaciente(schema, exame);

    // Cabeçalho
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LAUDO DE EXAME LABORATORIAL', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SECSA DIGITAL - Laboratório de Análises Clínicas', pageWidth / 2, yPosition, { align: 'center' });
    
    // Linha separadora
    yPosition += 5;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Informações do Paciente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO PACIENTE', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const dadosPaciente = [
      `Nome: ${exame.paciente.nome}`,
      `CPF: ${exame.paciente.cpf}`,
      `Idade: ${exame.paciente.idadeNaData} anos`,
      `Sexo: ${exame.paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}`,
      `Data de Nascimento: ${this.formatDateSimple(exame.paciente.dataNascimento)}`
    ];

    dadosPaciente.forEach(linha => {
      doc.text(linha, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 3;

    // Informações do Exame
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO EXAME', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const dadosExame = [
      `Exame: ${schema.nome}`,
      `Data da Coleta: ${this.formatDateComplete(exame.dataColeta)}`,
      `Data de Cadastro: ${this.formatDateComplete(exame.dataCadastro)}`,
      `Data de Finalização: ${exame.dataFinalizacao ? this.formatDateComplete(exame.dataFinalizacao) : '-'}`
    ];

    dadosExame.forEach(linha => {
      doc.text(linha, margin, yPosition);
      yPosition += 5;
    });

    yPosition += 5;

    // Resultados por Grupo
    const grupos = this.getGruposParametros(schema);
    
    grupos.forEach((grupo, index) => {
      // Verificar se precisa de nova página
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Título do Grupo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(41, 128, 185);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(grupo, margin + 2, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 5;

      // Tabela de Resultados
      const parametros = schema.parametros.filter(p => p.grupo === grupo);
      const tableData = parametros.map(param => {
        const resultado = exame.resultados?.[param.id];
        const valor = resultado ? `${resultado.valor} ${param.unidade}` : '-';
        
        // Usar faixa específica do paciente
        const faixa = faixasPorParametro.get(param.id);
        let referencia = '-';
        if (faixa) {
          referencia = `${faixa.min} - ${faixa.max} ${param.unidade}`;
          if (faixa.descricao && faixa.descricao !== 'Padrão') {
            referencia += ` (${faixa.descricao})`;
          }
        }

        return [
          param.label + (param.isCalculado ? ' (calc.)' : ''),
          valor,
          referencia
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Parâmetro', 'Resultado', 'Valores de Referência']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [52, 73, 94],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 45, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 55, halign: 'center' }
        },
        margin: { left: margin, right: margin }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 5;

      // Observações do Grupo
      if (exame.observacoesGrupos && exame.observacoesGrupos[grupo]) {
        if (yPosition > 260) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Observações - ${grupo}:`, margin, yPosition);
        yPosition += 5;
        
        doc.setFont('helvetica', 'normal');
        const obsLines = doc.splitTextToSize(exame.observacoesGrupos[grupo], pageWidth - 2 * margin);
        doc.text(obsLines, margin, yPosition);
        yPosition += (obsLines.length * 4) + 5;
      }

      yPosition += 3;
    });

    // Observações Técnicas Gerais
    if (exame.observacoesTecnicas) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(243, 156, 18);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('OBSERVAÇÕES TÉCNICAS', margin + 2, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(exame.observacoesTecnicas, pageWidth - 2 * margin);
      doc.text(obsLines, margin, yPosition);
      yPosition += (obsLines.length * 4) + 10;
    }

    // Rodapé - Assinatura
    const finalPageHeight = doc.internal.pageSize.getHeight();
    let footerY = Math.max(yPosition + 20, finalPageHeight - 40);

    // Se não couber na página atual, adiciona nova página
    if (footerY > finalPageHeight - 30) {
      doc.addPage();
      footerY = finalPageHeight - 40;
    }

    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 40, footerY, pageWidth / 2 + 40, footerY);
    footerY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Responsável Técnico', pageWidth / 2, footerY, { align: 'center' });
    footerY += 4;
    doc.text('CRF XXXXX/XX', pageWidth / 2, footerY, { align: 'center' });

    // Informações do rodapé
    footerY += 10;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Documento gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    // Gerar PDF
    const fileName = `Laudo_${exame.schemaNome.replace(/\s+/g, '_')}_${exame.paciente.nome.replace(/\s+/g, '_')}_${this.formatDateFile(exame.dataColeta)}.pdf`;
    doc.save(fileName);
  }

  private getGruposParametros(schema: SchemaExame): string[] {
    const grupos = new Set<string>();
    schema.parametros.forEach(p => {
      if (p.grupo) grupos.add(p.grupo);
    });
    return Array.from(grupos);
  }

  private calcularFaixasPaciente(schema: SchemaExame, exame: ExameRealizado): Map<string, FaixaReferencia | null> {
    const faixasPorParametro = new Map<string, FaixaReferencia | null>();
    
    // Preparar dados do paciente
    const dataNascimento = exame.paciente.dataNascimento.toDate();
    const dataExame = exame.dataColeta.toDate();
    
    const idades = this.faixaReferenciaService.calcularIdades(dataNascimento, dataExame);
    const dadosPaciente = {
      ...idades,
      sexo: exame.paciente.sexo
    };

    // Calcular faixa para cada parâmetro (incluindo calculados)
    schema.parametros.forEach(parametro => {
      const faixa = this.faixaReferenciaService.selecionarFaixa(parametro, dadosPaciente);
      faixasPorParametro.set(parametro.id, faixa);
    });

    return faixasPorParametro;
  }

  private formatDateSimple(timestamp: any): string {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  private formatDateComplete(timestamp: any): string {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private formatDateFile(timestamp: any): string {
    if (!timestamp) return 'sem_data';
    const date = timestamp.toDate();
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}${mes}${ano}`;
  }
}
