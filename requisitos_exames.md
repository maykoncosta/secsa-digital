<div align="center">
  <h1>🔬 Módulo de Exames</h1>
  <p><strong>Requisitos e Regras de Negócio</strong></p>
  
  <p>Especificação técnica para o gerenciamento completo do ciclo de vida de exames laboratoriais</p>

  ![Status](https://img.shields.io/badge/Status-Especificação-blue?style=for-the-badge)
  ![Qualidade](https://img.shields.io/badge/Qualidade-ISO_15189-green?style=for-the-badge)
</div>

---

## 📑 Índice

- [Objetivo do Módulo](#-1-objetivo-do-módulo)
- [Requisitos Funcionais](#-2-requisitos-funcionais-rf)
- [Regras de Negócio](#-3-regras-de-negócio-rn)
- [Modelo de Dados](#-4-modelo-de-dados)
- [Interface e Experiência](#-5-interface-e-experiência-ux)
- [Fluxo de Estados](#-6-fluxo-de-estados)
- [Próximos Passos](#-7-próximos-passos-técnicos)

---

## 🎯 1. Objetivo do Módulo

Permitir o **gerenciamento completo do ciclo de vida de exames laboratoriais**, desde a solicitação até a liberação de resultados, garantindo:

- ✅ Rastreabilidade completa do processo
- ✅ Flexibilidade para diferentes tipos de exames
- ✅ Validação de resultados e valores de referência
- ✅ Controle de qualidade e auditoria
- ✅ Integração com sistema de pacientes

---

## ⚙️ 2. Requisitos Funcionais (RF)

### 2.1 Gestão de Schemas de Exames

| ID | Requisito | Descrição |
|----|-----------|-----------|
| **RF01** | Cadastro de Schema | Permitir criação de "modelos" de exames com parâmetros configuráveis |
| **RF02** | Categorização | Organizar exames por categorias (Hematologia, Bioquímica, Microbiologia, etc.) |
| **RF03** | Parâmetros Dinâmicos | Cada exame pode ter N parâmetros com tipos diferentes (numérico, texto, booleano) |
| **RF04** | Valores de Referência | Configurar faixas normais por sexo, idade e condições especiais |
| **RF05** | Parâметros Calculados | Suportar fórmulas para resultados derivados (ex: LDL calculado) |
| **RF06** | Ativação/Inativação | Controlar disponibilidade de schemas sem perder histórico |

### 2.2 Solicitação e Realização de Exames

| ID | Requisito | Descrição |
|----|-----------|-----------|
| **RF07** | Vincular Paciente | Toda realização de exame deve estar vinculada a um paciente cadastrado |
| **RF08** | Data de Coleta | Registrar data e hora da coleta do material biológico |
| **RF09** | Lançamento de Resultados | Preenchimento dos valores para cada parâmetro do schema |
| **RF10** | Validação Técnica | Permitir revisão técnica antes da liberação |
| **RF11** | Liberação de Laudo | Gerar laudo final com assinatura digital do responsável técnico |
| **RF12** | Histórico do Paciente | Visualizar todos os exames realizados por um paciente |

### 2.3 Consulta e Relatórios

| ID | Requisito | Descrição |
|----|-----------|-----------|
| **RF13** | Listagem de Exames Realizados | Filtros por paciente, período, status, categoria |
| **RF14** | Impressão de Laudos | Gerar PDF formatado com logo e assinatura |
| **RF15** | Dashboard Estatístico | Exames mais solicitados, tempo médio de liberação, etc. |

---

## 📋 3. Regras de Negócio (RN)

### 3.1 Schemas de Exames

#### RN01 - Obrigatoriedade de Campos no Schema

> Todo schema de exame deve conter obrigatoriamente:
> - Nome do exame
> - Categoria
> - Pelo menos 1 parâmetro configurado

```typescript
interface ValidacaoSchema {
  nome: string; // obrigatório
  categoria: string; // obrigatório
  parametros: ParametroExame[]; // mínimo 1
}
```

#### RN02 - Unicidade de Nome

> Não pode haver dois schemas ativos com o mesmo nome.

**Implementação:** Validação no Firestore antes de salvar.

#### RN03 - Inativação de Schemas

> Schemas só podem ser inativados se não houver exames "pendentes" vinculados a eles.
> Exames finalizados ou liberados mantêm o histórico do schema mesmo se inativado.

#### RN04 - Parâmetros Obrigatórios vs Opcionais

> Cada parâmetro pode ser marcado como obrigatório. Durante o lançamento de resultados, o sistema deve impedir a finalização se algum campo obrigatório estiver vazio.

```typescript
interface ParametroExame {
  id: string;
  label: string;
  obrigatorio: boolean; // RN04
  tipo: 'number' | 'text' | 'boolean' | 'select';
  opcoes?: string[]; // para tipo 'select'
}
```

#### RN05 - Parâmetros Calculados

> Parâmetros com `isCalculado = true` não podem ser editados manualmente.
> Seus valores devem ser recalculados automaticamente quando seus dependentes forem alterados.

**Exemplo:** Cálculo de LDL pelo Friedewald
```typescript
// LDL = Colesterol Total - HDL - (Triglicerídeos / 5)
formula: "colesterolTotal - hdl - (triglicerideos / 5)"
```

### 3.2 Realização de Exames

#### RN06 - Validação de Paciente Ativo

> Só é permitido solicitar exames para pacientes com `status = 'ativo'`.

#### RN07 - Data de Coleta Máxima

> A data de coleta não pode ser superior à data atual.
> A data de coleta não pode ser anterior a 90 dias da data atual (exames não podem ser retroativos além de 3 meses).

```typescript
const dataColeta = new Date(input);
const hoje = new Date();
const limite = new Date();
limite.setDate(limite.getDate() - 90);

if (dataColeta > hoje) throw new Error('Data não pode ser futura');
if (dataColeta < limite) throw new Error('Data muito antiga');
```

#### RN08 - Idade na Data do Exame

> O sistema deve calcular e armazenar a **idade exata do paciente na data da coleta**, pois valores de referência podem mudar conforme a idade.

```typescript
idadeNaData = calcularIdade(paciente.dataNascimento, exame.dataColeta);
```

#### RN09 - Sexo Biológico

> O campo "sexo" é obrigatório para exames que possuem parâmetros com valores de referência diferenciados por sexo.

### 3.3 Fluxo de Estados

#### RN10 - Estados do Exame

```typescript
enum StatusExame {
  PENDENTE = 'pendente',     // Coleta realizada, aguardando resultados
  FINALIZADO = 'finalizado', // Resultados lançados, aguardando validação
  LIBERADO = 'liberado'      // Validado e disponível para impressão
}
```

#### RN11 - Transições de Estado

| De | Para | Condição |
|----|------|----------|
| `pendente` | `finalizado` | Todos os parâmetros obrigatórios preenchidos |
| `finalizado` | `liberado` | Validação técnica aprovada |
| `finalizado` | `pendente` | Correção solicitada pelo validador |
| `liberado` | `finalizado` | **Bloqueado** - exames liberados não podem retornar |

#### RN12 - Edição de Resultados

> Resultados só podem ser editados enquanto o exame estiver em `pendente` ou `finalizado`.
> Exames `liberado` são **imutáveis**.

**Auditoria:** Toda edição deve registrar:
```typescript
interface HistoricoEdicao {
  usuario: string;
  dataHora: Timestamp;
  campoAlterado: string;
  valorAnterior: any;
  valorNovo: any;
}
```

#### RN13 - Impressão de Laudos

> Apenas exames com `status = 'liberado'` podem ter laudos impressos.

### 3.4 Valores de Referência

#### RN14 - Faixas de Normalidade

> O sistema deve suportar valores de referência dinâmicos baseados em:
> - Sexo (M/F)
> - Faixas etárias
> - Condições especiais (gestante, diabético, etc.)

```typescript
interface ValorReferencia {
  parametroId: string;
  condicoes: {
    sexo?: 'M' | 'F';
    idadeMin?: number;
    idadeMax?: number;
    condicaoEspecial?: string;
  };
  min: number;
  max: number;
  unidade: string;
}
```

**Exemplo:**
```json
{
  "parametroId": "hemoglobina",
  "sexo": "M",
  "idadeMin": 18,
  "min": 13.5,
  "max": 17.5,
  "unidade": "g/dL"
}
```

### 3.5 Categorização

#### RN15 - Categorias Pré-definidas

O sistema deve suportar as seguintes categorias principais:

- **Hematologia** (Hemograma, Coagulograma)
- **Bioquímica** (Glicose, Ureia, Creatinina, Eletrólitos)
- **Lipidograma** (Colesterol, Triglicerídeos, HDL, LDL)
- **Hormônios** (TSH, T4 Livre, Insulina)
- **Sorologias** (Anti-HIV, VDRL, HBsAg)
- **Microbiologia** (Urinocultura, Hemocultura)
- **Parasitologia** (Parasitológico de Fezes)
- **Urinálise** (EAS - Elementos Anormais do Sedimento)

**Extensível:** Permitir criação de novas categorias personalizadas.

---

## 🗂️ 4. Modelo de Dados

### 4.1 Coleção: `schemas-exames`

```typescript
interface SchemaExame {
  id: string; // gerado automaticamente
  nome: string; // "Hemograma Completo"
  categoria: string; // "Hematologia"
  ativo: boolean; // true/false
  parametros: ParametroExame[];
  observacoes?: string; // Orientações gerais
  
  // Metadados
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  criadoPor: string; // uid do usuário
}

interface ParametroExame {
  id: string; // "hemoglobina"
  label: string; // "Hemoglobina"
  unidade: string; // "g/dL"
  tipo: 'number' | 'text' | 'boolean' | 'select';
  obrigatorio: boolean;
  grupo?: string; // "Série Vermelha", "Série Branca"
  
  // Valores calculados
  isCalculado: boolean;
  formula?: string; // "param1 + param2 / 100"
  
  // Validações
  min?: number; // valor mínimo aceitável
  max?: number; // valor máximo aceitável
  
  // Para tipo 'select'
  opcoes?: string[];
}
```

### 4.2 Coleção: `exames-realizados`

```typescript
interface ExameRealizado {
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
    idadeNaData: number; // RN08
  };
  
  // Processo
  status: 'pendente' | 'finalizado' | 'liberado'; // RN10
  dataColeta: Timestamp; // RN07
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
}

interface ResultadoParametro {
  valor: any; // number | string | boolean
  unidade: string;
  avaliacaoAutomatica?: {
    status: 'normal' | 'baixo' | 'alto';
    icone: string;
    referenciaAplicada: ValorReferencia;
  };
}
```

### 4.3 Coleção: `valores-referencia`

```typescript
interface ValorReferencia {
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
```

---

## 🎨 5. Interface e Experiência (UX)

### 5.1 Tela de Gestão de Schemas

**Componente:** `schemas-exames-list.component.ts`

**Funcionalidades:**
- ✅ Listagem em cards ou tabela com filtros por categoria e status
- ✅ Busca por nome do exame
- ✅ Ação rápida: Ativar/Inativar
- ✅ Modal de criação/edição com builder de parâmetros

**Visual:**
```
┌─────────────────────────────────────────────┐
│ Schemas de Exames                    [+ Novo]│
├─────────────────────────────────────────────┤
│ Filtros: [Categoria ▼] [Status ▼] 🔍        │
├─────────────────────────────────────────────┤
│ 📊 Hemograma Completo                       │
│    Hematologia • 15 parâmetros • Ativo      │
│    [Editar] [Inativar] [Ver Histórico]      │
├─────────────────────────────────────────────┤
│ 💉 Glicemia de Jejum                        │
│    Bioquímica • 1 parâmetro • Ativo         │
│    [Editar] [Inativar] [Ver Histórico]      │
└─────────────────────────────────────────────┘
```

### 5.2 Tela de Realização de Exames

**Componente:** `exames-list.component.ts`

**Funcionalidades:**
- ✅ Listagem de exames pendentes, finalizados e liberados
- ✅ Filtros: Paciente, Período, Status, Categoria
- ✅ Ações contextuais por status:
  - `pendente`: Lançar resultados
  - `finalizado`: Validar/Liberar ou Retornar para correção
  - `liberado`: Imprimir laudo, visualizar

**Kanban Board (Opcional):**
```
┌─────────────┬─────────────┬─────────────┐
│  Pendente   │ Finalizado  │  Liberado   │
├─────────────┼─────────────┼─────────────┤
│ Hemograma   │ Glicemia    │ TSH         │
│ João Silva  │ Maria Costa │ Pedro Lima  │
│ 24/12/2025  │ 23/12/2025  │ 22/12/2025  │
│ [Lançar]    │ [Validar]   │ [Imprimir]  │
└─────────────┴─────────────┴─────────────┘
```

### 5.3 Modal de Lançamento de Resultados

**Componente:** `exame-resultado-modal.component.ts`

**Layout:**
```
┌────────────────────────────────────────────────┐
│ Hemograma Completo - João Silva (M, 45 anos)  │
│ Coleta: 24/12/2025 08:30                       │
├────────────────────────────────────────────────┤
│ Série Vermelha                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ Hemoglobina  [_____] g/dL  (13.5 - 17.5) │   │
│ │ Hematócrito  [_____] %     (40 - 54)     │   │
│ │ Hemácias     [_____] /mm³  (4.5 - 6.0)   │   │
│ └──────────────────────────────────────────┘   │
│                                                │
│ Série Branca                                   │
│ ┌──────────────────────────────────────────┐   │
│ │ Leucócitos   [_____] /mm³  (4000-11000)  │   │
│ │ ...                                      │   │
│ └──────────────────────────────────────────┘   │
│                                                │
│ Observações Técnicas:                          │
│ [___________________________________]          │
│                                                │
│ [Cancelar]              [Salvar como Pendente] │
│                         [Finalizar p/ Validar] │
└────────────────────────────────────────────────┘
```

**Comportamentos:**
- Campos obrigatórios destacados com `*`
- Valores fora da referência ficam em vermelho com ícone ↑ ou ↓
- Parâmetros calculados aparecem em cinza (readonly)

### 5.4 Validação e Liberação

**Componente:** `exame-validacao.component.ts`

**Funcionalidades:**
- ✅ Visualizar resultados em modo leitura
- ✅ Comparar com exames anteriores do paciente (se houver)
- ✅ Adicionar observações do validador
- ✅ Ações:
  - **Liberar:** Finaliza o processo e permite impressão
  - **Retornar para Correção:** Volta para status `pendente` com comentário

### 5.5 Laudo (PDF)

**Componente:** `exame-laudo.component.ts` + serviço de geração PDF

**Estrutura:**
```
┌─────────────────────────────────────────────┐
│ [LOGO CLÍNICA]           LAUDO LABORATORIAL │
├─────────────────────────────────────────────┤
│ Paciente: João Silva                        │
│ CPF: 123.456.789-00   Sexo: M   Idade: 45a  │
│ Data da Coleta: 24/12/2025 às 08:30         │
├─────────────────────────────────────────────┤
│ HEMOGRAMA COMPLETO                          │
│                                             │
│ Série Vermelha           Resultado   Ref.   │
│ ───────────────────────────────────────────│
│ Hemoglobina              14.2 g/dL   13.5-17│
│ Hematócrito              42%         40-54  │
│ Hemácias           ↓     4.1/mm³     4.5-6.0│
│                                             │
│ Observações:                                │
│ Discreta anemia. Avaliar necessidade de... │
├─────────────────────────────────────────────┤
│ Dr. Carlos Andrade - CRF 12345              │
│ Responsável Técnico                         │
│ Assinatura Digital: ████████████            │
│                                             │
│ Liberado em: 25/12/2025 às 14:00            │
└─────────────────────────────────────────────┘
```

---

## 🔄 6. Fluxo de Estados

### 6.1 Diagrama de Transições

```
    ┌──────────┐
    │ SOLICITAÇÃO│
    └─────┬─────┘
          │
          ▼
    ┌──────────┐
    │ PENDENTE │◄──────────┐
    └─────┬─────┘           │
          │                 │
          │ Lançar          │ Retornar para
          │ Resultados      │ Correção
          │                 │
          ▼                 │
   ┌─────────────┐          │
   │ FINALIZADO  ├──────────┘
   └──────┬──────┘
          │
          │ Validar/
          │ Liberar
          │
          ▼
    ┌──────────┐
    │ LIBERADO │ ──► (Imutável)
    └──────────┘
```

### 6.2 Permissões por Perfil

| Ação | Recepcionista | Técnico | Responsável Técnico | Admin |
|------|---------------|---------|---------------------|-------|
| Solicitar exame | ✅ | ✅ | ✅ | ✅ |
| Lançar resultados | ❌ | ✅ | ✅ | ✅ |
| Finalizar exame | ❌ | ✅ | ✅ | ✅ |
| Validar/Liberar | ❌ | ❌ | ✅ | ✅ |
| Criar schemas | ❌ | ❌ | ✅ | ✅ |
| Imprimir laudo | ✅ | ✅ | ✅ | ✅ |

---

## 🚀 7. Próximos Passos Técnicos

### 7.1 Estrutura de Arquivos a Criar

```
src/app/
├── data/
│   ├── interfaces/
│   │   ├── schema-exame.interface.ts ✅ (já existe parcialmente)
│   │   ├── exame-realizado.interface.ts
│   │   └── valor-referencia.interface.ts
│   │
│   └── repositories/
│       ├── schema-exame.repository.ts
│       ├── exame-realizado.repository.ts
│       └── valor-referencia.repository.ts
│
└── features/
    └── exames/
        ├── schemas/
        │   ├── schemas-exames-list.component.ts
        │   ├── schema-exame-form-modal.component.ts
        │   └── parametro-builder.component.ts
        │
        ├── realizados/
        │   ├── exames-list.component.ts
        │   ├── exame-resultado-modal.component.ts
        │   ├── exame-validacao.component.ts
        │   └── exame-laudo.component.ts
        │
        └── shared/
            ├── valor-referencia.service.ts
            ├── calculo-formula.service.ts
            └── pdf-laudo.service.ts
```

### 7.2 Bibliotecas Necessárias

```bash
npm install mathjs           # Para avaliar fórmulas de parâmetros calculados
npm install pdfmake          # Para geração de laudos em PDF
npm install @angular/cdk     # Para Drag & Drop (se usar Kanban)
```

### 7.3 Testes Unitários Prioritários

- ✅ Validação de schemas (RN01, RN02)
- ✅ Cálculo de idade na data (RN08)
- ✅ Transições de estado (RN10, RN11)
- ✅ Avaliação de valores de referência (RN15)
- ✅ Execução de fórmulas para parâmetros calculados (RN05)

### 7.4 Integração com Pacientes

- Validar status ativo do paciente antes de solicitar exame (RN06)
- Carregar histórico de exames na tela de detalhes do paciente
- Dashboard: "Últimos 5 exames" no prontuário

---

<div align="center">
  <p><strong>Especificação v1.0</strong></p>
  <p>Módulo de Exames • SECSA Digital</p>
  <p>Última atualização: 25/12/2025</p>
</div>
