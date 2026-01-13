import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExameRealizado, SchemaExame, FaixaReferencia } from '../../data/interfaces/exame.interface';
import { FaixaReferenciaService } from './faixa-referencia.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

interface ConfiguracaoInstituicao {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  logoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfLaudoService {
  private faixaReferenciaService = inject(FaixaReferenciaService);
  private firestore = inject(Firestore);
  private configInstituicao: ConfiguracaoInstituicao | null = null;

  async gerarLaudo(exame: ExameRealizado, schema: SchemaExame): Promise<void> {
    // Carregar configurações da instituição
    await this.carregarConfigInstituicao();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 12;

    // Calcular faixas de referência para o paciente
    const faixasPorParametro = this.calcularFaixasPaciente(schema, exame);

    // Logo ao lado do nome da instituição (se existir)
    const logoSize = 20;
    let xTextoInicio = margin;
    
    if (this.configInstituicao?.logoUrl) {
      try {
        // Logo à esquerda
        doc.addImage(
          this.configInstituicao.logoUrl, 
          'PNG', 
          margin, 
          yPosition, 
          logoSize, 
          logoSize
        );
        // Texto começa após a logo
        xTextoInicio = margin + logoSize + 5;
      } catch (error) {
        console.error('Erro ao adicionar logo ao PDF:', error);
      }
    }

    // Nome da instituição ao lado da logo
    const nomeInstituicao = this.configInstituicao?.nome || 'SECSA DIGITAL';
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(nomeInstituicao, xTextoInicio, yPosition + 6);
    
    yPosition += 8;
    doc.setFontSize(14);
    doc.text('LAUDO DE EXAME LABORATORIAL', xTextoInicio, yPosition + 6);
    
    yPosition += logoSize;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Dados da instituição em uma linha compacta (centralizado)
    const infoInstituicao = [];
    if (this.configInstituicao?.endereco) infoInstituicao.push(this.configInstituicao.endereco);
    if (this.configInstituicao?.telefone) infoInstituicao.push(`Tel: ${this.configInstituicao.telefone}`);
    if (this.configInstituicao?.email) infoInstituicao.push(this.configInstituicao.email);
    if (this.configInstituicao?.cnpj) infoInstituicao.push(`CNPJ: ${this.configInstituicao.cnpj}`);
    
    if (infoInstituicao.length > 0) {
      doc.text(infoInstituicao.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
    }
    
    // Linha separadora
    yPosition += 2;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Informações lado a lado: Paciente (esquerda) e Exame (direita)
    const metadeLargura = (pageWidth - 2 * margin) / 2;
    const yInicioDados = yPosition;
    
    // COLUNA ESQUERDA - Dados do Paciente
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO PACIENTE', margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const dadosPaciente = [
      `Nome: ${exame.paciente.nome}`,
      `CPF: ${exame.paciente.cpf}`,
      `Sexo: ${exame.paciente.sexo === 'M' ? 'Masculino' : 'Feminino'}`,
      `Idade: ${exame.paciente.idadeNaData} anos`,
      `Nasc.: ${this.formatDateSimple(exame.paciente.dataNascimento)}`
    ];

    dadosPaciente.forEach(linha => {
      doc.text(linha, margin, yPosition);
      yPosition += 4.5;
    });

    // COLUNA DIREITA - Dados do Exame
    let yExame = yInicioDados;
    const xExame = margin + metadeLargura + 5;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO EXAME', xExame, yExame);
    yExame += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const dadosExame = [
      `Exame: ${schema.nome}`,
      `Coleta: ${this.formatDateComplete(exame.dataColeta)}`,
      `Cadastro: ${this.formatDateComplete(exame.dataCadastro)}`,
      `Finalização: ${exame.dataFinalizacao ? this.formatDateComplete(exame.dataFinalizacao) : '-'}`,
      `Status: ${exame.status.toUpperCase()}`
    ];

    dadosExame.forEach(linha => {
      doc.text(linha, xExame, yExame);
      yExame += 4.5;
    });

    // Ajustar yPosition para o maior valor entre as duas colunas
    yPosition = Math.max(yPosition, yExame) + 5;

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

  private async carregarConfigInstituicao(): Promise<void> {
    // Se já carregou, não precisa carregar novamente
    if (this.configInstituicao) {
      return;
    }

    try {
      const configDoc = await getDoc(doc(this.firestore, 'configuracoes', 'instituicao'));
      
      if (configDoc.exists()) {
        const data = configDoc.data();
        this.configInstituicao = {
          nome: data['nome'] || 'SECSA DIGITAL',
          cnpj: data['cnpj'],
          endereco: data['endereco'],
          telefone: data['telefone'],
          email: data['email'],
          logoUrl: data['logoUrl']
        };
      } else {
        // Configuração padrão
        this.configInstituicao = {
          nome: 'SECSA DIGITAL'
        };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da instituição:', error);
      // Usar configuração padrão em caso de erro
      this.configInstituicao = {
        nome: 'SECSA DIGITAL'
      };
    }
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
