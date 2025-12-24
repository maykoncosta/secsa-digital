<div align="center">
  <h1>🎨 Guia de Padronização UI/UX</h1>
  <p><strong>SECSA Digital - Design System</strong></p>
  
  <p>Diretrizes visuais e comportamentais para garantir consistência, acessibilidade e excelente experiência do usuário</p>

  ![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=for-the-badge)
  ![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
</div>

---

## 📑 Índice

- [Paleta de Cores](#-1-paleta-de-cores)
- [Tipografia](#-2-tipografia)
- [Formulários](#-3-formulários)
- [Modais e Diálogos](#-4-modais-e-diálogos)
- [Mensagens e Feedback](#-5-mensagens-e-feedback)
- [Botões e Ações](#-6-botões-e-ações)
- [Espaçamento e Grade](#-7-espaçamento-e-grade)

---

## 🎨 1. Paleta de Cores

As cores devem ser aplicadas de forma **semântica** para orientar o usuário.

### 1.1 Cores Principais

| Cor | Código | Uso |
|-----|--------|-----|
| **Primária (Ação)** | ![#2563EB](https://via.placeholder.com/15/2563EB/000000?text=+) `#2563EB` | Botões de ação principal, links importantes e destaques |
| **Secundária** | ![#64748B](https://via.placeholder.com/15/64748B/000000?text=+) `#64748B` | Elementos de apoio e ícones secundários |

### 1.2 Cores de Estado (Semânticas)

| Estado | Código | Contexto |
|--------|--------|----------|
| **Sucesso** | ![#10B981](https://via.placeholder.com/15/10B981/000000?text=+) `#10B981` | Confirmações e conclusões |
| **Erro** | ![#EF4444](https://via.placeholder.com/15/EF4444/000000?text=+) `#EF4444` | Mensagens de erro, alertas críticos e ações destrutivas |
| **Aviso** | ![#F59E0B](https://via.placeholder.com/15/F59E0B/000000?text=+) `#F59E0B` | Atenção e estados intermediários |
| **Informativo** | ![#3B82F6](https://via.placeholder.com/15/3B82F6/000000?text=+) `#3B82F6` | Dicas e notas informativas |

### 1.3 Neutros

```css
/* Backgrounds */
--bg-page: #F8FAFC;
--bg-surface: #FFFFFF;

/* Borders */
--border-default: #E2E8F0;

/* Text */
--text-primary: #1E293B;
--text-secondary: #64748B;
```

---

## ✍️ 2. Tipografia

**Fonte Principal:** Inter ou Roboto (Sans Serif)

| Elemento | Tamanho | Peso | Cor | Uso |
|----------|---------|------|-----|-----|
| **Títulos (H1)** | `24px` | Semi-bold | Neutra Principal | Cabeçalhos principais |
| **Subtítulos (H2)** | `18px` | Medium | Neutra Principal | Seções e divisões |
| **Corpo de Texto** | `14px` / `16px` | Regular | Neutra Secundária | Conteúdo geral |
| **Labels/Legendas** | `12px` | Semi-bold | Neutra Secundária | Rótulos de formulário |

### Exemplo de Aplicação

```html
<h1 class="text-2xl font-semibold text-slate-900">Título Principal</h1>
<h2 class="text-lg font-medium text-slate-900">Subtítulo</h2>
<p class="text-base text-slate-600">Corpo de texto</p>
<label class="text-xs font-semibold text-slate-600">Label</label>
```

---

## 📝 3. Formulários

### 3.1 Regras de Layout

- ✅ **Labels:** Sempre acima do campo de entrada. Nunca use apenas placeholders
- ✅ **Espaçamento:** Margem inferior de `16px` (1rem) entre campos de formulário
- ✅ **Agrupamento:** Campos relacionados (ex: Endereço) devem ser agrupados visualmente ou em colunas

### 3.2 Estados dos Inputs

| Estado | Estilo | Comportamento |
|--------|--------|---------------|
| **Default** | Borda `#D1D5DB`, fundo branco | Estado inicial |
| **Focus** | Borda `#2563EB` com outline suave | Interação ativa |
| **Erro** | Borda `#EF4444` + texto de ajuda vermelho | Validação falhou |
| **Desabilitado** | Fundo `#F1F5F9`, cursor `not-allowed` | Campo inativo |

### 3.3 Validação

```typescript
// Validação em tempo real (onBlur)
<input
  class="border border-gray-300 focus:border-blue-600"
  (blur)="validateField()"
/>
```

**Regras:**
- A validação deve ser, preferencialmente, em tempo real após o usuário sair do campo (`onBlur`)
- Campos obrigatórios devem ter um asterisco `*` ou indicação clara

---

## 💬 4. Modais e Diálogos

### 4.1 Estrutura

```
┌─────────────────────────────────────┐
│ Header (Título + Botão Fechar ✕)  │
├─────────────────────────────────────┤
│                                     │
│ Body (Conteúdo)                    │
│                                     │
├─────────────────────────────────────┤
│ Footer (Ações: Cancelar | Confirmar)│
└─────────────────────────────────────┘
```

**Componentes:**
- **Overlay:** Fundo escurecido com 50% de opacidade `rgba(0,0,0,0.5)`
- **Header:** Título claro e botão de fechar (✕) no canto superior direito
- **Body:** Conteúdo focado, evitando rolagens excessivas
- **Footer:** Ações alinhadas à direita. Botão de ação principal vem por último

### 4.2 Tipos de Modais

| Tipo | Botões | Uso |
|------|--------|-----|
| **Informativo** | "Fechar" | Apenas comunicação |
| **Confirmação** | "Cancelar" + "Confirmar" | Ações que precisam de confirmação |
| **Ação Crítica** | "Cancelar" + "Excluir" (vermelho) | Operações destrutivas |

---

## 🔔 5. Mensagens e Feedback (Toasts)

### Posicionamento e Duração

- **Localização:** Canto superior direito ou centro-topo
- **Duração Automática:** 3 a 5 segundos
- **Erros:** Podem exigir fechamento manual

### Anatomia do Toast

```html
<div class="toast toast-success">
  <icon>✓</icon>
  <span>Paciente cadastrado com sucesso!</span>
</div>
```

### Ícones por Tipo

| Tipo | Ícone | Cor |
|------|-------|-----|
| Sucesso | ✓ Check | Verde `#10B981` |
| Erro | ⚠ Triângulo | Vermelho `#EF4444` |
| Aviso | ⚠ Exclamação | Âmbar `#F59E0B` |
| Info | ℹ Info | Azul `#3B82F6` |

### Linguagem

✅ **Bom:** "Não foi possível salvar os dados"  
❌ **Evite:** "Erro 0x882: Database connection failed"

**Princípio:** Clara, direta e nunca técnica demais

---

## 🔘 6. Botões e Ações

### Variantes

| Variante | Estilo | Uso |
|----------|--------|-----|
| **Primário** | Fundo sólido colorido, texto branco, border-radius `8px` | Ação principal |
| **Secundário/Outline** | Borda colorida, fundo transparente, texto colorido | Ação secundária |
| **Ghost** | Sem borda ou fundo, apenas texto | Ações de menor importância |

### Estados

```typescript
// Loading State
<button [disabled]="isLoading" class="btn-primary">
  <span *ngIf="isLoading">
    <spinner />
  </span>
  {{ isLoading ? 'Salvando...' : 'Salvar' }}
</button>
```

**Importante:** Quando em processamento, o botão deve mostrar um spinner e ficar desabilitado para evitar cliques duplos

---

## 📐 7. Espaçamento e Grade (Layout)

### Sistema de 8px

Todos os espaçamentos (margens, paddings) devem ser **múltiplos de 8**:

```
8px, 16px, 24px, 32px, 48px, 64px
```

### Tailwind CSS Equivalentes

```css
space-2  →  8px
space-4  →  16px
space-6  →  24px
space-8  →  32px
space-12 →  48px
space-16 →  64px
```

### Grid System

| Breakpoint | Largura | Margens |
|------------|---------|---------|
| **Desktop** | Max `1200px` centralizado | Auto |
| **Tablet** | Fluid | `32px` lateral |
| **Mobile** | Fluid | `16px` lateral |

### Exemplo de Container

```html
<div class="container mx-auto max-w-screen-xl px-4 md:px-8">
  <!-- Conteúdo -->
</div>
```

---

<div align="center">
  <p><strong>Design System v1.0</strong></p>
  <p>Mantido pela equipe de desenvolvimento SECSA Digital</p>
  <p>Última atualização: Dezembro 2025</p>
</div>