# 🔬 Módulo de Exames - Documentação Técnica

## 📂 Estrutura de Arquivos

```
features/exames/
├── exames.component.ts                  # Container principal com navegação
│
├── pages/                                # Páginas/Listas principais
│   ├── exames-realizados-list.component.ts
│   └── schemas-exames-list.component.ts
│
└── components/
    └── modals/                           # Componentes modais
        ├── exame-realizado-form-modal.component.ts
        ├── lancar-resultados-modal.component.ts
        ├── schema-exame-edit-modal.component.ts
        ├── schema-exame-form-modal.component.ts
        └── visualizar-resultado-modal.component.ts
```

---

## 🧩 Componentes

### 1. Container Principal

#### `exames.component.ts`
**Responsabilidade:** Container principal com navegação entre schemas e exames realizados

**Features:**
- Menu de navegação entre sub-rotas
- Outlet para renderizar componentes filhos
- Layout consistente

**Rotas:**
- `/exames/schemas` → Lista de schemas
- `/exames/realizados` → Lista de exames realizados

---

### 2. Pages (Listas)

#### `pages/schemas-exames-list.component.ts`
**Responsabilidade:** Listar e gerenciar schemas (templates) de exames

**Funcionalidades:**
- ✅ Listagem de todos os schemas cadastrados
- ✅ Filtros por nome, categoria e status
- ✅ Criar novo schema
- ✅ Editar valores de referência de um schema
- ✅ Ativar/Inativar schemas
- ✅ Excluir schemas (com validação)

**Dependencies:**
- `SchemaExameRepository` - Acesso aos dados
- `SchemaExameFormModalComponent` - Modal de criação/edição
- `SchemaExameEditModalComponent` - Modal de edição de valores de referência
- `ToastService` - Notificações

**Signals:**
```typescript
schemas = signal<SchemaExame[]>([]);
filteredSchemas = signal<SchemaExame[]>([]);
loading = signal(false);
searchTerm = '';
categoriaFilter = '';
statusFilter = '';
```

---

#### `pages/exames-realizados-list.component.ts`
**Responsabilidade:** Listar e gerenciar exames realizados (instâncias)

**Funcionalidades:**
- ✅ Listagem de todos os exames realizados
- ✅ Filtros por paciente, status e período
- ✅ Criar novo exame realizado
- ✅ Lançar resultados
- ✅ Visualizar resultados
- ✅ Gerar laudo em PDF
- ✅ Indicadores visuais de status

**Dependencies:**
- `ExameRealizadoRepository` - Acesso aos dados
- `SchemaExameRepository` - Buscar schema do exame
- `PdfLaudoService` - Geração de laudos
- `ExameRealizadoFormModalComponent` - Modal de cadastro
- `LancarResultadosModalComponent` - Modal de lançamento
- `VisualizarResultadoModalComponent` - Modal de visualização
- `ToastService` - Notificações

**Signals:**
```typescript
exames = signal<ExameRealizado[]>([]);
filteredExames = signal<ExameRealizado[]>([]);
loading = signal(false);
searchTerm = '';
statusFilter = '';
```

**Status possíveis:**
- 🟡 `pendente` - Exame cadastrado, aguardando resultados
- 🟢 `finalizado` - Resultados lançados, aguardando liberação
- 🔵 `liberado` - Laudo liberado para o paciente

---

### 3. Modals (Componentes de Interface)

#### `components/modals/exame-realizado-form-modal.component.ts`
**Responsabilidade:** Cadastrar novo exame realizado

**Inputs:**
```typescript
exameToEdit = input<ExameRealizado | null>(null);
```

**Outputs:**
```typescript
close = output<void>();
saved = output<ExameRealizado>();
```

**Form Fields:**
- Paciente (busca com autocomplete)
- Schema de Exame (select)
- Data da Coleta (date picker)
- Observações (textarea opcional)

**Validações:**
- Paciente obrigatório
- Schema obrigatório
- Data de coleta não pode ser futura
- Data de coleta não pode ser anterior a 90 dias

---

#### `components/modals/lancar-resultados-modal.component.ts`
**Responsabilidade:** Lançar/editar resultados de um exame

**Inputs:**
```typescript
exameId = input.required<string>();
```

**Outputs:**
```typescript
close = output<void>();
saved = output<void>();
```

**Features:**
- ✅ Agrupamento de parâmetros por categoria
- ✅ Cálculo automático de valores derivados (VCM, HCM, etc.)
- ✅ Validação de faixas de referência
- ✅ Indicadores visuais (dentro/fora da faixa)
- ✅ Campos obrigatórios marcados
- ✅ Campos calculados bloqueados

**Lógica de Cálculo:**
```typescript
// Exemplo: Cálculo de VCM
parametrosComStatus = computed(() => {
  const params = this.schema()?.parametros || [];
  return params.map(param => {
    if (param.isCalculado && param.formula) {
      const valor = this.calcularFormula(param.formula);
      return { ...param, valor };
    }
    return param;
  });
});
```

---

#### `components/modals/schema-exame-form-modal.component.ts`
**Responsabilidade:** Criar/editar schema de exame

**Inputs:**
```typescript
schema = input<SchemaExame | null>(null);
isEditMode = computed(() => !!this.schema());
```

**Outputs:**
```typescript
close = output<void>();
saved = output<SchemaExame>();
```

**Form Structure:**
```typescript
form = this.fb.group({
  nome: ['', Validators.required],
  categoria: ['', Validators.required],
  ativo: [true],
  observacoes: [''],
  parametros: this.fb.array([])
});
```

**Gerenciamento de Parâmetros:**
- Adicionar/remover parâmetros dinamicamente
- Configurar tipo (number, text, boolean, select)
- Marcar como obrigatório
- Definir grupo (para agrupamento visual)
- Marcar como calculado
- Definir fórmula de cálculo

---

#### `components/modals/schema-exame-edit-modal.component.ts`
**Responsabilidade:** Editar valores de referência de um schema

**Inputs:**
```typescript
schemaId = input.required<string>();
```

**Outputs:**
```typescript
close = output<void>();
saved = output<void>();
```

**Features:**
- ✅ Edição de faixas de referência por parâmetro
- ✅ Múltiplas faixas por parâmetro (sexo, idade, condições)
- ✅ Interface intuitiva agrupada por categoria
- ✅ Validação de valores mín/máx

**Estrutura de Faixa:**
```typescript
interface FaixaReferencia {
  id: string;
  descricao: string;          // "Homens adultos"
  min: number;
  max: number;
  condicao?: {
    tipo: 'idade' | 'sexo' | 'idade_e_sexo';
    sexo?: 'M' | 'F';
    idadeMin?: number;
    idadeMax?: number;
  };
  ordem: number;
}
```

---

#### `components/modals/visualizar-resultado-modal.component.ts`
**Responsabilidade:** Visualizar resultados e gerar PDF

**Inputs:**
```typescript
exameId = input.required<string>();
```

**Outputs:**
```typescript
close = output<void>();
```

**Features:**
- ✅ Visualização completa dos resultados
- ✅ Dados do paciente e do exame
- ✅ Resultados agrupados por categoria
- ✅ Indicadores de faixa de referência
- ✅ Geração de laudo em PDF
- ✅ Layout otimizado para impressão

**Indicadores Visuais:**
- 🟢 Verde: Dentro da faixa
- 🔴 Vermelho: Fora da faixa
- ⚪ Cinza: Sem valor de referência

---

## 🔄 Fluxo de Trabalho

### 1. Cadastrar Schema de Exame
```
SchemasListComponent
  → Clicar "Novo Schema"
  → SchemaExameFormModalComponent
  → Preencher dados
  → Adicionar parâmetros
  → Salvar
  → SchemaExameRepository.create()
```

### 2. Configurar Valores de Referência
```
SchemasListComponent
  → Clicar "Editar Valores"
  → SchemaExameEditModalComponent
  → Adicionar faixas por parâmetro
  → Definir condições (sexo, idade)
  → Salvar
  → SchemaExameRepository.update()
```

### 3. Realizar Exame
```
ExamesRealizadosListComponent
  → Clicar "Novo Exame"
  → ExameRealizadoFormModalComponent
  → Buscar paciente
  → Selecionar schema
  → Informar data coleta
  → Salvar (status: pendente)
  → ExameRealizadoRepository.create()
```

### 4. Lançar Resultados
```
ExamesRealizadosListComponent
  → Clicar "Lançar Resultados"
  → LancarResultadosModalComponent
  → Preencher valores
  → Valores calculados automáticos
  → Validação de faixas
  → Salvar (status: finalizado)
  → ExameRealizadoRepository.update()
```

### 5. Liberar Laudo
```
ExamesRealizadosListComponent
  → Clicar "Visualizar"
  → VisualizarResultadoModalComponent
  → Revisar resultados
  → Clicar "Gerar PDF"
  → PdfLaudoService.gerarLaudo()
  → Download do arquivo
```

---

## 🎨 Padrões de Design

### Signal-based Reactivity
```typescript
// State management com signals
const data = signal<Data[]>([]);
const loading = signal(false);

// Computed values
const filteredData = computed(() => 
  data().filter(item => item.active)
);

// Effects para side effects
effect(() => {
  console.log('Data changed:', data());
});
```

### Repository Pattern
```typescript
// Acesso a dados centralizado
export class ExameRealizadoRepository {
  async getAll(): Promise<ExameRealizado[]> { }
  async getById(id: string): Promise<ExameRealizado | null> { }
  async create(data: Omit<ExameRealizado, 'uid'>): Promise<string> { }
  async update(id: string, data: Partial<ExameRealizado>): Promise<void> { }
}
```

### Modal Pattern
```typescript
// Padrão consistente para todos os modais
export class ModalComponent {
  isOpen = signal(false);
  close = output<void>();
  
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
```

---

## 🧪 Testes

### Unit Tests
```typescript
// Exemplo de teste de componente
describe('ExamesRealizadosListComponent', () => {
  it('should filter exames by search term', () => {
    component.searchTerm = 'João';
    component.onSearch();
    expect(component.filteredExames().length).toBeGreaterThan(0);
  });
  
  it('should open modal when clicking new button', () => {
    component.openNewExameModal();
    expect(component.showModal()).toBe(true);
  });
});
```

### Integration Tests
```typescript
// Teste de fluxo completo
it('should create exame and launch results', async () => {
  // 1. Criar exame
  const exameId = await repository.create(mockExame);
  
  // 2. Lançar resultados
  await repository.update(exameId, { 
    status: 'finalizado',
    resultados: mockResultados 
  });
  
  // 3. Verificar
  const exame = await repository.getById(exameId);
  expect(exame?.status).toBe('finalizado');
});
```

---

## 📦 Dependencies

### Angular
- `@angular/core` - Framework base
- `@angular/common` - Diretivas e pipes comuns
- `@angular/forms` - Reactive Forms
- `@angular/router` - Roteamento

### Firebase
- `@angular/fire` - Integração Firebase
- `firebase/firestore` - Banco de dados

### UI
- `lucide-angular` - Ícones
- `tailwindcss` - Estilos

### Utilities
- `jspdf` - Geração de PDF
- `jspdf-autotable` - Tabelas em PDF

---

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Adicionar testes unitários
- [ ] Implementar paginação nas listas
- [ ] Adicionar exportação para Excel
- [ ] Melhorar feedback visual de loading

### Médio Prazo
- [ ] Implementar cache de schemas
- [ ] Adicionar histórico de edições
- [ ] Implementar aprovação de resultados
- [ ] Adicionar anexos (imagens/PDFs)

### Longo Prazo
- [ ] Integração com equipamentos laboratoriais
- [ ] Dashboard de estatísticas
- [ ] Relatórios gerenciais
- [ ] App mobile

---

## 📞 Suporte

Para dúvidas sobre o módulo de exames:
1. Consulte este README
2. Verifique o arquivo `MELHORIAS.md`
3. Consulte os requisitos em `requisitos_exames.md`
4. Revise o código-fonte com comentários JSDoc

---

**Última atualização:** Janeiro 2026  
**Versão:** 2.0.0 (Refatorado)
