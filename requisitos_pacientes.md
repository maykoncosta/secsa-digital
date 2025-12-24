<div align="center">
  <h1>👥 Módulo de Pacientes</h1>
  <p><strong>Requisitos e Regras de Negócio</strong></p>
  
  <p>Especificação técnica para o gerenciamento completo do ciclo de vida do paciente</p>

  ![Status](https://img.shields.io/badge/Status-Especificação-blue?style=for-the-badge)
  ![LGPD](https://img.shields.io/badge/LGPD-Compliant-green?style=for-the-badge)
</div>

---

## 📑 Índice

- [Objetivo do Módulo](#-1-objetivo-do-módulo)
- [Requisitos Funcionais](#-2-requisitos-funcionais-rf)
- [Regras de Negócio](#-3-regras-de-negócio-rn)
- [Modelo de Dados](#-4-modelo-de-dados)
- [Interface e Experiência](#-5-interface-e-experiência-ux)
- [Próximos Passos](#-6-próximos-passos-técnicos)

---

## 🎯 1. Objetivo do Módulo

Permitir o **gerenciamento completo do ciclo de vida do paciente** no sistema, desde o cadastro inicial até o histórico de atendimentos, garantindo:

- ✅ Integridade dos dados
- ✅ Conformidade com normas de privacidade (**LGPD**)
- ✅ Rastreabilidade de informações
- ✅ Facilidade de acesso e consulta

---

## ⚙️ 2. Requisitos Funcionais (RF)

| ID | Requisito | Descrição |
|----|-----------|-----------|
| **RF01** | Cadastro de Paciente | O sistema deve permitir a inclusão de novos pacientes com dados pessoais e de contato |
| **RF02** | Listagem e Busca | O sistema deve listar pacientes com filtros por Nome, CPF, CNS ou Código Interno |
| **RF03** | Edição de Dados | Deve ser possível atualizar qualquer informação do prontuário do paciente |
| **RF04** | Inativação (Soft Delete) | Pacientes não podem ser excluídos se houver histórico médico. Devem ser marcados como "Inativos" |
| **RF05** | Histórico de Consultas | Visualização rápida das últimas passagens do paciente pela clínica |
| **RF06** | Anexos | Upload de documentos (RG digitalizado, exames anteriores) em formato PDF ou imagem |

---

## 📋 3. Regras de Negócio (RN)

### 3.1 Validação de Identidade

#### RN01 - Identificação Obrigatória

> O sistema deve exigir **obrigatoriamente** o preenchimento de pelo menos um dos campos: **CPF** ou **CNS** (Cartão Nacional de Saúde).

```typescript
// Validação condicional
if (!cpf && !cns) {
  throw new Error('Informe CPF ou CNS');
}
```

#### RN02 - Unicidade de Documentos

> Não pode haver dois pacientes cadastrados com o mesmo CPF ou com o mesmo número de CNS.

**Implementação:** Query no Firestore antes de salvar

#### RN03 - Menores de Idade

> Caso a data de nascimento indique idade inferior a **18 anos**, o campo "Responsável Legal" (Nome e CPF) torna-se **obrigatório**.

```typescript
const idade = calcularIdade(dataNascimento);
if (idade < 18) {
  camposObrigatorios.push('responsavelLegal');
}
```

#### RN04 - Formatação e Máscaras

| Campo | Padrão | Validação |
|-------|--------|-----------|
| **CPF** | `000.000.000-00` | Validar algoritmo de dígito verificador |
| **CNS** | `000 0000 0000 0000` | Validar estrutura oficial (15 dígitos) |
| **Telefone** | `(00) 00000-0000` | Formato brasileiro |

### 3.2 Comportamento do Sistema

#### RN05 - Status do Paciente

- **Status Padrão:** `Ativo`
- **Permissão:** Apenas administradores podem alterar para `Inativo`

```typescript
enum StatusPaciente {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}
```

#### RN06 - Prontuário Eletrônico

> O número do prontuário deve ser gerado **automaticamente** e ser **sequencial**.

**Exemplo:** `PAC-00001`, `PAC-00002`, ...

---

## 🗄️ 4. Modelo de Dados

### Estrutura de Campos

| Campo | Tipo | Obrigatório | Observações |
|-------|------|-------------|-------------|
| **Nome Completo** | `string` | ✅ Sim | Mínimo 3 caracteres |
| **Data de Nascimento** | `Date` | ✅ Sim | Não pode ser data futura |
| **CPF** | `string` | ⚠️ Condicional | Obrigatório se CNS não informado. Validar algoritmo |
| **CNS** | `string` | ⚠️ Condicional | Obrigatório se CPF não informado. 15 dígitos |
| **E-mail** | `string` | ❌ Não | Validar formato `@` |
| **Telemóvel** | `string` | ✅ Sim | Formato `(00) 00000-0000` |
| **Gênero** | `enum` | ✅ Sim | Masculino, Feminino, Outro, Não Informado |
| **Endereço** | `object` | ❌ Não | CEP, Rua, Número, Cidade, Estado |
| **Responsável Legal** | `object` | ⚠️ Condicional | Obrigatório para menores de 18 anos |
| **Status** | `enum` | ✅ Sim | Ativo (padrão) ou Inativo |
| **Número Prontuário** | `string` | ✅ Sim | Gerado automaticamente |

### Interface TypeScript

```typescript
interface Paciente {
  id: string;
  numeroProntuario: string;
  nomeCompleto: string;
  dataNascimento: Date;
  cpf?: string;
  cns?: string;
  email?: string;
  telefone: string;
  genero: 'M' | 'F' | 'Outro' | 'NaoInformado';
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  responsavelLegal?: {
    nome: string;
    cpf: string;
    parentesco: string;
  };
  status: 'ativo' | 'inativo';
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}
```

---

## 🎨 5. Interface e Experiência (UX)

Seguindo o [Guia de Padronização de Interface](ui.md):

### 5.1 Tela de Listagem

```html
<!-- Estrutura da Listagem -->
<div class="container">
  <div class="flex justify-between items-center mb-6">
    <h1>Pacientes</h1>
    <button class="btn-primary">+ Novo Paciente</button>
  </div>
  
  <table class="w-full hover:bg-gray-50">
    <!-- Tabela de pacientes -->
  </table>
</div>
```

**Características:**
- ✅ Tabela com `hover` para destacar linhas
- ✅ Botão "Novo Paciente" em destaque (Azul Primário `#2563EB`) no topo direito
- ✅ Filtros por Nome, CPF, CNS ou Código Interno

### 5.2 Formulário de Cadastro

**Opções:**
- Modal para cadastros rápidos
- Página dedicada para cadastros complexos

**Agrupamento de Campos:**

```
┌─────────────────────────────────┐
│ 👤 Dados Pessoais              │
│ - Nome Completo                │
│ - Data de Nascimento           │
│ - Gênero                       │
├─────────────────────────────────┤
│ 🆔 Identificação               │
│ - CPF                          │
│ - CNS                          │
│ - Número do Prontuário (auto) │
├─────────────────────────────────┤
│ 📞 Contato                     │
│ - Telefone                     │
│ - E-mail                       │
├─────────────────────────────────┤
│ 📍 Endereço                    │
│ - CEP, Rua, Número...          │
└─────────────────────────────────┘
```

### 5.3 Feedback Visual

#### Validação de CPF/CNS

**Cenário:** Usuário tenta salvar sem CPF e sem CNS

```html
<div class="form-group">
  <input 
    [class.border-red-500]="!cpf && !cns && submitted"
    placeholder="CPF"
  />
  <span class="text-red-500 text-xs">
    Informe CPF ou CNS
  </span>
</div>
```

#### Mensagens de Sucesso/Erro

| Evento | Tipo | Mensagem | Cor |
|--------|------|----------|-----|
| Cadastro com sucesso | Toast | "Paciente cadastrado com sucesso!" | Verde `#10B981` |
| Duplicidade de CPF | Error | "CPF já cadastrado no sistema" | Vermelho `#EF4444` |
| Duplicidade de CNS | Error | "CNS já cadastrado no sistema" | Vermelho `#EF4444` |

### 5.4 Ações Críticas

**Inativação de Paciente:**

```html
<!-- Modal de Confirmação -->
<div class="modal">
  <h2>Confirmar Inativação</h2>
  <p>Tem certeza que deseja inativar este paciente?</p>
  
  <div class="modal-footer">
    <button class="btn-ghost">Cancelar</button>
    <button class="btn-danger">Inativar</button>
  </div>
</div>
```

---

## 🚀 6. Próximos Passos Técnicos

### Checklist de Desenvolvimento

- [ ] **Componente de Tabela de Pacientes**
  - [ ] Implementar colunas: Nome, CPF, CNS, Status, Ações
  - [ ] Adicionar filtros de busca
  - [ ] Implementar paginação

- [ ] **Modal/Página de Cadastro**
  - [ ] Criar formulário reativo com validações
  - [ ] Implementar lógica condicional (CPF ou CNS)
  - [ ] Adicionar máscara de inputs (CPF, CNS, Telefone)
  - [ ] Validar campos obrigatórios para menores de idade

- [ ] **Serviços e Repositórios**
  - [ ] `PacienteService` para regras de negócio
  - [ ] `PacienteRepository` para acesso ao Firestore
  - [ ] Validadores customizados (CPF, CNS)

- [ ] **Integração com Firestore**
  - [ ] Criar coleção `pacientes`
  - [ ] Implementar queries de busca
  - [ ] Adicionar índices compostos

- [ ] **Testes**
  - [ ] Testes unitários de validação
  - [ ] Testes de integração com Firebase
  - [ ] Testes E2E do fluxo de cadastro

---

<div align="center">
  <p><strong>Especificação Técnica v1.0</strong></p>
  <p>Módulo de Pacientes - SECSA Digital</p>
  <p>Última atualização: Dezembro 2025</p>
</div>