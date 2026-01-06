# 📁 Estrutura do Projeto - SECSA Digital

## Visão Geral da Nova Estrutura

```
c:\projetos\secsa-digital\
│
├── 📄 README.md                      # Documentação principal do projeto
├── 📄 MELHORIAS.md                   # ✨ NOVO - Análise e melhorias implementadas
├── 📄 RESUMO_EXECUTIVO.md            # ✨ NOVO - Resumo da refatoração
├── 📄 requisitos_exames.md           # Requisitos de negócio - Exames
├── 📄 requisitos_pacientes.md        # Requisitos de negócio - Pacientes
├── 📄 ui.md                          # Guia de UI/UX
│
├── 📁 scripts/
│   └── PERMISSOES.md
│
└── 📁 secsa-digital/                 # Aplicação Angular
    ├── angular.json
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    │
    ├── 📁 public/
    │
    ├── 📁 scripts/
    │   ├── README.md
    │   ├── seed-hemograma-client.js
    │   └── seed-hemograma.js
    │
    └── 📁 src/
        ├── index.html
        ├── main.ts
        ├── styles.scss
        │
        ├── 📁 environments/
        │   ├── environment.prod.ts
        │   └── environment.ts
        │
        └── 📁 app/
            ├── app.config.ts
            ├── app.html
            ├── app.routes.ts              # 🔧 Rotas atualizadas
            ├── app.scss
            ├── app.ts
            │
            ├── 📁 core/                    # Serviços Singleton
            │   └── services/
            │       ├── faixa-referencia.service.ts
            │       ├── firestore.service.ts
            │       ├── pdf-laudo.service.ts
            │       └── toast.service.ts
            │
            ├── 📁 data/                    # Camada de Dados
            │   ├── interfaces/
            │   │   ├── exame.interface.ts
            │   │   └── paciente.interface.ts
            │   └── repositories/
            │       ├── exame-realizado.repository.ts
            │       ├── paciente.repository.ts
            │       └── schema-exame.repository.ts
            │
            ├── 📁 shared/                  # Componentes Reutilizáveis
            │   ├── components/
            │   │   ├── button.component.ts
            │   │   ├── input.component.ts
            │   │   ├── layout.component.ts
            │   │   └── toast-container.component.ts
            │   └── pipes/
            │       ├── cns.pipe.ts
            │       ├── cpf.pipe.ts
            │       └── telefone.pipe.ts
            │
            └── 📁 features/                # Módulos de Funcionalidades
                │
                ├── 📁 dashboard/
                │   └── dashboard.component.ts
                │
                ├── 📁 pacientes/           # 💡 Próximo para refatorar
                │   ├── paciente-form-modal.component.ts
                │   └── pacientes-list.component.ts
                │
                └── 📁 exames/              # ✨ REFATORADO
                    ├── exames.component.ts
                    ├── 📄 README.md        # ✨ NOVO - Docs do módulo
                    │
                    ├── 📁 pages/           # ✨ NOVO - Páginas/Listas
                    │   ├── exames-realizados-list.component.ts
                    │   └── schemas-exames-list.component.ts
                    │
                    └── 📁 components/      # ✨ NOVO - Componentes
                        └── modals/         # ✨ NOVO - Modais
                            ├── exame-realizado-form-modal.component.ts
                            ├── lancar-resultados-modal.component.ts
                            ├── schema-exame-edit-modal.component.ts
                            ├── schema-exame-form-modal.component.ts
                            └── visualizar-resultado-modal.component.ts
```

---

## 📊 Comparação Antes vs Depois

### Módulo de Exames

#### ❌ ANTES (Desorganizado)
```
exames/
├── exames.component.ts
├── exame-realizado-form-modal.component.ts
├── exames-realizados-list.component.ts
├── lancar-resultados-modal.component.ts
├── schema-exame-edit-modal.component.ts
├── schema-exame-form-modal.component.ts
├── schemas-exames-list.component.ts
└── visualizar-resultado-modal.component.ts
```
**Problemas:**
- 7 componentes misturados
- Difícil identificar responsabilidades
- Não escalável
- Manutenção complexa

#### ✅ DEPOIS (Organizado)
```
exames/
├── exames.component.ts
├── README.md
├── pages/
│   ├── exames-realizados-list.component.ts
│   └── schemas-exames-list.component.ts
└── components/
    └── modals/
        ├── exame-realizado-form-modal.component.ts
        ├── lancar-resultados-modal.component.ts
        ├── schema-exame-edit-modal.component.ts
        ├── schema-exame-form-modal.component.ts
        └── visualizar-resultado-modal.component.ts
```
**Benefícios:**
- Separação clara de responsabilidades
- Fácil localização de componentes
- Escalável
- Bem documentado

---

## 🎯 Padrão de Organização Definido

### Para Features Complexas (Exames, Pacientes, etc.)

```
feature/
├── feature.component.ts          # Container principal
├── README.md                     # Documentação do módulo
│
├── pages/                        # Páginas/Listas principais
│   ├── list.component.ts
│   └── detail.component.ts
│
├── components/                   # Componentes específicos
│   ├── cards/
│   │   └── card.component.ts
│   ├── forms/
│   │   └── form.component.ts
│   └── modals/
│       └── modal.component.ts
│
└── services/                     # Serviços específicos (se necessário)
    └── feature.service.ts
```

### Princípios
1. **Separação por Tipo**: Pages, Components, Services
2. **Agrupamento Lógico**: Modais juntos, formulários juntos
3. **Escalabilidade**: Fácil adicionar novos componentes
4. **Documentação**: README em cada feature complexa

---

## 📚 Documentação do Projeto

### Arquivos de Documentação

| Arquivo | Localização | Conteúdo |
|---------|-------------|----------|
| **README.md** | `/` | Visão geral do projeto, stack, arquitetura |
| **MELHORIAS.md** | `/` | Análise completa, melhorias implementadas, próximos passos |
| **RESUMO_EXECUTIVO.md** | `/` | Resumo da refatoração, métricas, checklist |
| **ESTRUTURA.md** | `/` | Este arquivo - visualização da estrutura |
| **requisitos_exames.md** | `/` | Requisitos funcionais e regras de negócio |
| **requisitos_pacientes.md** | `/` | Requisitos funcionais e regras de negócio |
| **ui.md** | `/` | Guia de UI/UX, design system |
| **exames/README.md** | `/secsa-digital/src/app/features/exames/` | Docs técnicos do módulo de exames |

---

## 🔄 Fluxo de Desenvolvimento

### Para Adicionar um Novo Modal em Exames:

1. Criar arquivo em `features/exames/components/modals/`
   ```
   nome-do-modal.component.ts
   ```

2. Implementar seguindo padrão:
   ```typescript
   @Component({
     selector: 'app-nome-do-modal',
     standalone: true,
     imports: [/* ... */],
     template: `/* ... */`
   })
   export class NomeDoModalComponent {
     isOpen = signal(false);
     close = output<void>();
     // ...
   }
   ```

3. Importar no componente pai (pages/):
   ```typescript
   import { NomeDoModalComponent } from '../components/modals/nome-do-modal.component';
   ```

4. Usar no template:
   ```html
   <app-nome-do-modal 
     [isOpen]="showModal()"
     (close)="handleClose()"
   />
   ```

---

## 🧪 Convenções de Nomenclatura

### Arquivos
```
// Componentes
nome-do-componente.component.ts

// Services
nome-do-service.service.ts

// Interfaces
nome-da-interface.interface.ts

// Repositories
nome-do-repository.repository.ts

// Guards
nome-do-guard.guard.ts

// Pipes
nome-do-pipe.pipe.ts
```

### Classes/Interfaces
```typescript
// Componentes
export class NomeDoComponenteComponent { }

// Services
export class NomeDoServiceService { }

// Interfaces
export interface NomeDaInterface { }

// Repositories
export class NomeDoRepositoryRepository { }
```

### Signals e Computed
```typescript
// Signals (substantivos)
data = signal<Data[]>([]);
loading = signal(false);
isOpen = signal(false);

// Computed (substantivos derivados)
filteredData = computed(() => /* ... */);
hasData = computed(() => this.data().length > 0);

// Outputs (verbos no infinitivo)
onSave = output<Data>();
close = output<void>();
```

---

## 🎨 Estrutura de Templates

### Modais
```html
<!-- Modal wrapper -->
<div class="fixed inset-0 z-50 overflow-y-auto">
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50"></div>
  
  <!-- Modal content -->
  <div class="relative bg-white rounded-xl shadow-2xl">
    <!-- Header -->
    <div class="px-6 py-4 border-b">
      <h2>Título</h2>
      <button (click)="close.emit()">×</button>
    </div>
    
    <!-- Body -->
    <div class="px-6 py-4">
      <!-- Conteúdo -->
    </div>
    
    <!-- Footer -->
    <div class="px-6 py-4 border-t">
      <app-button>Ação</app-button>
    </div>
  </div>
</div>
```

### Listas
```html
<app-layout>
  <div header>Título da Página</div>
  
  <!-- Filtros -->
  <div class="bg-white rounded-lg shadow-sm p-6">
    <!-- Campos de filtro -->
  </div>
  
  <!-- Tabela/Cards -->
  <div class="bg-white rounded-lg shadow-sm">
    @if (loading()) {
      <!-- Loading state -->
    } @else if (items().length === 0) {
      <!-- Empty state -->
    } @else {
      <!-- Lista de itens -->
    }
  </div>
</app-layout>
```

---

## 🚀 Próximas Estruturas a Refatorar

### 1. Módulo de Pacientes (Prioridade: Alta)
```
pacientes/
├── pacientes.component.ts
├── README.md
├── pages/
│   └── pacientes-list.component.ts
└── components/
    └── modals/
        └── paciente-form-modal.component.ts
```

### 2. Módulo de Dashboard (Prioridade: Média)
```
dashboard/
├── dashboard.component.ts
├── README.md
└── components/
    ├── cards/
    │   ├── stats-card.component.ts
    │   └── chart-card.component.ts
    └── widgets/
        └── recent-exams-widget.component.ts
```

---

## 📦 Dependências por Camada

### Core (Singleton Services)
- Não depende de features
- Usado por todas as camadas

### Data (Repositories & Interfaces)
- Depende de: Core (services)
- Usado por: Features

### Shared (Componentes Reutilizáveis)
- Não depende de features
- Usado por: Features

### Features (Módulos de Negócio)
- Depende de: Core, Data, Shared
- Não deve depender de outras features

---

## 🔍 Comandos Úteis

### Localizar Componente
```powershell
Get-ChildItem -Recurse -Filter "*nome*.component.ts"
```

### Verificar Imports
```powershell
Select-String -Path "*.ts" -Pattern "import.*from" -Recurse
```

### Contar Componentes por Tipo
```powershell
(Get-ChildItem -Recurse -Filter "*.component.ts").Count
(Get-ChildItem -Recurse -Filter "*.service.ts").Count
(Get-ChildItem -Recurse -Filter "*.interface.ts").Count
```

---

<div align="center">
  <p><strong>SECSA Digital - Estrutura Organizada e Documentada</strong></p>
  <p>Janeiro 2026</p>
</div>
