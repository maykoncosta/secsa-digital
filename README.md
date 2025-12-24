<div align="center">
  <h1>🏥 SECSA Digital</h1>
  <p><strong>Gestão Laboratorial Inteligente</strong></p>
  
  <p>Sistema web de alta performance para gerenciamento de laboratórios de análises clínicas</p>

  ![Angular](https://img.shields.io/badge/Angular-18+-DD0031?style=for-the-badge&logo=angular&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
</div>

---

## 📋 Sobre o Projeto

Sistema web desenvolvido com Angular 18, Tailwind CSS e Firebase, utilizando uma arquitetura data-driven onde a lógica dos exames é configurada dinamicamente via banco de dados. Ideal para laboratórios de análises clínicas que buscam modernização e eficiência.

### ✨ Principais Características

- 🔄 **Exames Dinâmicos**: Configuração de exames via banco de dados, sem necessidade de alterar código
- 🧮 **Cálculos Automáticos**: Processamento reativo em tempo real usando Angular Signals
- 📱 **Design Responsivo**: Interface moderna com Tailwind CSS
- 🔐 **Autenticação Segura**: Integração completa com Firebase Authentication
- 📄 **Geração de Laudos**: Exportação de relatórios em PDF com jsPDF
- ⚡ **Alta Performance**: Standalone Components e otimizações do Angular 18+

---

## 🛠️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|-----------|
| **Frontend** | Angular 18+ (Standalone Components & Signals) |
| **Estilização** | Tailwind CSS (Design Utilitário e Responsivo) |
| **Backend & DB** | Firebase (Firestore & Authentication) |
| **Ícones** | Lucide Angular |
| **Relatórios** | jsPDF + AutoTable |

---

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture**, garantindo separação de responsabilidades e código limpo:

```
src/app/
├── core/               # Singleton Services, Guards, Interceptors e Configurações Globais
│   ├── auth/           # Lógica de Autenticação Firebase
│   └── services/       # Abstração do Firestore e Notificações (Toast/Modais)
│
├── data/               # Camada de Dados e Regras de Negócio
│   ├── interfaces/     # Contratos TypeScript (Modelos de Dados)
│   ├── constants/      # Fórmulas de cálculos (Hematologia) e Enums
│   └── repositories/   # Classes de acesso a dados (Abstração da API)
│
├── shared/             # UI Kit e Componentes Reutilizáveis (Dumb Components)
│   ├── components/     # Botões, Inputs (Tailwind), Modais, Spinners
│   ├── pipes/          # Formatação (CPF, CNS, Telefone, Datas)
│   └── directives/     # Máscaras de input e validações de interface
│
└── features/           # Módulos de Funcionalidades (Lazy Loading)
    ├── pacientes/      # CRUD e Perfil de Pacientes
    ├── exames/         # Lançamento, Histórico e Laudos Dinâmicos
    └── dashboard/      # Métricas e Visão Geral
```

---

## 📊 Modelagem de Dados (Firestore)

### 1. Coleção: `configuracoesExames`

Armazena o "esquema" do exame. Isso permite adicionar novos tipos de exames sem alterar o código do Angular.

```typescript
interface SchemaExame {
  id: string;
  nome: string;          // ex: "Hemograma Completo"
  categoria: string;     // ex: "Hematologia"
  ativo: boolean;
  parametros: Array<{
    id: string;
    label: string;
    unidade: string;
    tipo: 'number' | 'text';
    grupo: string;       // ex: "Eritrograma"
    isCalculado: boolean;
    formula?: string;    // Lógica para VCM, HCM, etc.
  }>;
}
```

### 2. Coleção: `examesRealizados`

Salva o resultado e um snapshot dos valores de referência vigentes no momento do exame.

```typescript
interface ExameRealizado {
  uid: string;
  paciente: { 
    id: string; 
    nome: string; 
    cpf: string; 
    sexo: 'M' | 'F'; 
    idadeNaData: number 
  };
  status: 'pendente' | 'finalizado' | 'liberado';
  resultados: Record<string, any>; // Mapeamento idParametro -> valor
  dataColeta: Timestamp;
}
```

---

## 🩸 Lógica de Negócio: O Hemograma

O sistema utiliza **Angular Signals** para processamento reativo de cálculos em tempo real:

- **Eritrograma**: Cálculos automáticos de $VCM$, $HCM$ e $CHCM$ baseados em Hemácias, Hemoglobina e Hematócrito.
- **Leucograma**: Entrada de valores em % calcula automaticamente os valores absolutos em mm³ usando o total de Leucócitos.
- **Validação**: Comparação automática com `valoresReferencia` filtrados por sexo e faixa etária do paciente.

---

## 🎨 Padrões de Design e UI

Para evitar a "falta de padrão", o projeto segue estas diretrizes:

### Design System

- **Tailwind Primeiro**: Nenhuma folha de estilo CSS/SCSS gigante. Estilos aplicados via utilitários.
- **Componentização**: Inputs e Botões são componentes únicos em `shared/` para manter a consistência visual.
- **Ícones**: Uso padronizado da biblioteca Lucide.

### Estados de Feedback

| Status | Estilo | Cor |
|--------|--------|-----|
| 🟢 Normal | `bg-green-100 text-green-700` | Verde |
| 🟡 Alterado | `bg-yellow-100 text-yellow-700` | Amarelo |

---

## 🚀 Instalação e Setup

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Conta Firebase configurada

### Passos

1. **Clone o projeto:**
   ```bash
   git clone https://github.com/seu-usuario/secsa-digital.git
   cd secsa-digital
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   
   Crie o arquivo `src/environments/environment.ts` com suas credenciais do Firebase:
   ```typescript
   export const environment = {
     production: false,
     firebase: {
       apiKey: "SUA_API_KEY",
       authDomain: "SEU_AUTH_DOMAIN",
       projectId: "SEU_PROJECT_ID",
       storageBucket: "SEU_STORAGE_BUCKET",
       messagingSenderId: "SEU_MESSAGING_SENDER_ID",
       appId: "SEU_APP_ID"
     }
   };
   ```

4. **Execute o servidor de desenvolvimento:**
   ```bash
   ng serve
   ```

5. **Acesse a aplicação:**
   
   Abra seu navegador em `http://localhost:4200`

---

## 📝 Roadmap

- [x] Definição de Arquitetura e Tech Stack
- [ ] Implementação do Core Service (Auth & Firestore)
- [ ] UI Kit Shared (Componentes Tailwind Reutilizáveis)
- [ ] Módulo de Pacientes
- [ ] Motor de Exames Dinâmicos (Engine de Renderização)
- [ ] Geração de PDF e Assinatura Digital

---

## 👨‍💻 Autor

**Maykon Costa**

Arquitetando soluções sólidas para o setor da saúde.

---

## 📄 Licença

Este projeto é proprietário e todos os direitos são reservados.

---

<div align="center">
  <p>Desenvolvido com ❤️ para revolucionar a gestão laboratorial</p>
</div>