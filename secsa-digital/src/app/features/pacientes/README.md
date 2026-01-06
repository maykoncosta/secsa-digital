# 👥 Módulo de Pacientes - Documentação Técnica

## 📂 Estrutura de Arquivos

```
features/pacientes/
├── pages/                                    # Páginas/Listas principais
│   ├── pacientes-list.component.ts
│   └── pacientes-list.component.spec.ts
│
└── components/
    └── modals/                               # Componentes modais
        ├── paciente-form-modal.component.ts
        └── paciente-form-modal.component.spec.ts
```

---

## 🧩 Componentes

### 1. Pages (Listas)

#### `pages/pacientes-list.component.ts`
**Responsabilidade:** Listar e gerenciar pacientes do sistema

**Funcionalidades:**
- ✅ Listagem de todos os pacientes cadastrados
- ✅ Filtros por nome, CPF, CNS ou prontuário
- ✅ Criar novo paciente
- ✅ Editar dados de paciente existente
- ✅ Ativar/Inativar pacientes
- ✅ Excluir pacientes (com validação)
- ✅ Formatação de CPF, CNS e telefone

**Dependencies:**
- `PacienteRepository` - Acesso aos dados
- `PacienteFormModalComponent` - Modal de cadastro/edição
- `ToastService` - Notificações
- `CpfPipe`, `CnsPipe`, `TelefonePipe` - Formatação

**Signals:**
```typescript
pacientes = signal<Paciente[]>([]);
filteredPacientes = signal<Paciente[]>([]);
loading = signal(false);
searchTerm = '';
showModal = signal(false);
selectedPaciente = signal<Paciente | null>(null);
```

**Status possíveis:**
- 🟢 `ativo` - Paciente ativo no sistema
- 🔴 `inativo` - Paciente inativo (não pode receber novos exames)

---

### 2. Modals (Componentes de Interface)

#### `components/modals/paciente-form-modal.component.ts`
**Responsabilidade:** Cadastrar ou editar dados de um paciente

**Inputs:**
```typescript
paciente = input<Paciente | null>(null);
isEditMode = computed(() => !!this.paciente());
```

**Outputs:**
```typescript
close = output<void>();
saved = output<Paciente>();
```

**Form Fields:**

**Dados Pessoais:**
- Nome Completo (obrigatório)
- Data de Nascimento (obrigatório)
- Sexo (obrigatório)
- Nome da Mãe (obrigatório)
- Nome do Pai (opcional)

**Documentos:**
- CPF (obrigatório se não tiver CNS)
- CNS (obrigatório se não tiver CPF)
- RG (opcional)

**Contato:**
- Telefone Principal (obrigatório)
- Telefone Secundário (opcional)
- Email (opcional)

**Endereço:**
- CEP (obrigatório)
- Logradouro (obrigatório)
- Número (obrigatório)
- Complemento (opcional)
- Bairro (obrigatório)
- Cidade (obrigatório)
- Estado (obrigatório)

**Responsável Legal (para menores de 18 anos):**
- Nome do Responsável
- CPF do Responsável

**Validações:**
```typescript
// RN01 - Identificação obrigatória
if (!cpf && !cns) {
  throw new Error('Informe CPF ou CNS');
}

// RN03 - Menores de idade
const idade = calcularIdade(dataNascimento);
if (idade < 18) {
  camposObrigatorios.push('responsavelLegal');
}

// RN04 - Formatação
- CPF: 000.000.000-00 (com validação de dígitos)
- CNS: 000 0000 0000 0000 (15 dígitos)
- Telefone: (00) 00000-0000
```

---

## 🔄 Fluxo de Trabalho

### 1. Cadastrar Novo Paciente
```
PacientesListComponent
  → Clicar "Novo Paciente"
  → PacienteFormModalComponent
  → Preencher dados
  → Validar CPF/CNS
  → Verificar maioridade
  → Salvar
  → PacienteRepository.add()
  → Gera número de prontuário automático
```

### 2. Editar Paciente
```
PacientesListComponent
  → Clicar "Editar" no paciente
  → PacienteFormModalComponent (modo edição)
  → Atualizar dados
  → Validar alterações
  → Salvar
  → PacienteRepository.update()
```

### 3. Buscar Paciente
```
PacientesListComponent
  → Digitar termo de busca
  → Filtrar em tempo real
  → Busca em: Nome, CPF, CNS, Prontuário
  → Exibir resultados filtrados
```

### 4. Inativar Paciente
```
PacientesListComponent
  → Clicar "Inativar"
  → Confirmar ação
  → Verificar se não há exames pendentes
  → PacienteRepository.update({ status: 'inativo' })
```

---

## 🎨 Padrões de Design

### Signal-based Reactivity
```typescript
// State management
const pacientes = signal<Paciente[]>([]);
const loading = signal(false);

// Computed values
const filteredPacientes = computed(() => 
  pacientes().filter(p => 
    p.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase())
  )
);

// Effects
effect(() => {
  console.log('Pacientes updated:', pacientes().length);
});
```

### Repository Pattern
```typescript
export class PacienteRepository {
  async getAll(): Promise<Paciente[]> { }
  async getById(id: string): Promise<Paciente | null> { }
  async getByCpf(cpf: string): Promise<Paciente | null> { }
  async getByCns(cns: string): Promise<Paciente | null> { }
  async add(paciente: Omit<Paciente, 'id'>): Promise<string> { }
  async update(id: string, data: Partial<Paciente>): Promise<void> { }
  async delete(id: string): Promise<void> { }
}
```

### Modal Pattern
```typescript
export class PacienteFormModalComponent {
  close = output<void>();
  saved = output<Paciente>();
  
  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
  
  async onSubmit() {
    if (this.form.valid) {
      const paciente = await this.repository.add(this.form.value);
      this.saved.emit(paciente);
      this.close.emit();
    }
  }
}
```

---

## 🧪 Testes

### Unit Tests

#### `pacientes-list.component.spec.ts`
```typescript
describe('PacientesListComponent', () => {
  it('should filter patients by search term', () => {
    component.searchTerm = 'João';
    component.onSearch();
    expect(component.filteredPacientes().length).toBeGreaterThan(0);
  });
  
  it('should open modal when clicking new button', () => {
    component.openNewModal();
    expect(component.showModal()).toBe(true);
  });
  
  it('should load patients on init', async () => {
    await component.ngOnInit();
    expect(component.pacientes().length).toBeGreaterThan(0);
  });
});
```

#### `paciente-form-modal.component.spec.ts`
```typescript
describe('PacienteFormModalComponent', () => {
  it('should validate CPF or CNS required', () => {
    component.form.patchValue({ cpf: '', cns: '' });
    component.onSubmit();
    expect(component.form.invalid).toBe(true);
  });
  
  it('should require responsible for minors', () => {
    const dataNascimento = new Date();
    dataNascimento.setFullYear(dataNascimento.getFullYear() - 15);
    
    component.form.patchValue({ dataNascimento });
    expect(component.requiresResponsavel()).toBe(true);
  });
  
  it('should create patient successfully', async () => {
    component.form.patchValue(validPacienteData);
    await component.onSubmit();
    expect(repository.add).toHaveBeenCalled();
  });
});
```

---

## 📦 Dependencies

### Angular
- `@angular/core` - Framework base
- `@angular/common` - Diretivas e pipes comuns
- `@angular/forms` - Reactive Forms

### Firebase
- `@angular/fire` - Integração Firebase
- `firebase/firestore` - Banco de dados

### UI
- `lucide-angular` - Ícones
- `tailwindcss` - Estilos

### Pipes Customizados
- `CpfPipe` - Formata CPF (000.000.000-00)
- `CnsPipe` - Formata CNS (000 0000 0000 0000)
- `TelefonePipe` - Formata telefone ((00) 00000-0000)

---

## 📋 Regras de Negócio Implementadas

### RN01 - Identificação Obrigatória
> O sistema deve exigir obrigatoriamente o preenchimento de pelo menos um dos campos: CPF ou CNS.

```typescript
validators: [this.requireCpfOrCns()]

requireCpfOrCns(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = control.get('cpf')?.value;
    const cns = control.get('cns')?.value;
    return !cpf && !cns ? { cpfOrCnsRequired: true } : null;
  };
}
```

### RN02 - Unicidade de Documentos
> Não pode haver dois pacientes cadastrados com o mesmo CPF ou com o mesmo número de CNS.

```typescript
async validateUniqueness(cpf: string, cns: string, excludeId?: string) {
  if (cpf) {
    const existing = await this.repository.getByCpf(cpf);
    if (existing && existing.id !== excludeId) {
      throw new Error('CPF já cadastrado');
    }
  }
  
  if (cns) {
    const existing = await this.repository.getByCns(cns);
    if (existing && existing.id !== excludeId) {
      throw new Error('CNS já cadastrado');
    }
  }
}
```

### RN03 - Menores de Idade
> Caso a data de nascimento indique idade inferior a 18 anos, o campo "Responsável Legal" torna-se obrigatório.

```typescript
const idade = this.calcularIdade(dataNascimento);
if (idade < 18) {
  this.form.get('responsavelLegal')?.setValidators([Validators.required]);
  this.form.get('cpfResponsavel')?.setValidators([Validators.required]);
} else {
  this.form.get('responsavelLegal')?.clearValidators();
  this.form.get('cpfResponsavel')?.clearValidators();
}
```

### RN05 - Status do Paciente
> Status padrão: Ativo. Apenas administradores podem alterar para Inativo.

```typescript
status: 'ativo' | 'inativo' = 'ativo';

async toggleStatus(pacienteId: string) {
  // Verificar se há exames pendentes
  const examesPendentes = await this.exameRepository
    .getByPacienteAndStatus(pacienteId, 'pendente');
    
  if (examesPendentes.length > 0) {
    throw new Error('Não é possível inativar paciente com exames pendentes');
  }
  
  await this.repository.update(pacienteId, { status: 'inativo' });
}
```

---

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Adicionar foto do paciente
- [ ] Implementar busca avançada (filtros múltiplos)
- [ ] Exportar lista para Excel/PDF
- [ ] Histórico de alterações

### Médio Prazo
- [ ] Integração com API de CEP (ViaCEP)
- [ ] Validação de CPF online (Receita Federal)
- [ ] Gráficos de estatísticas
- [ ] Relatórios de pacientes

### Longo Prazo
- [ ] Importação em lote (CSV/Excel)
- [ ] Integração com cartão SUS
- [ ] Prontuário eletrônico completo
- [ ] Agendamento de consultas/exames

---

## 🔒 Segurança e Privacidade

### LGPD Compliance

**Dados Sensíveis Protegidos:**
- Nome completo
- CPF e CNS
- Data de nascimento
- Endereço completo
- Dados de saúde (exames)

**Medidas Implementadas:**
- ✅ Acesso restrito por autenticação
- ✅ Logs de auditoria
- ✅ Soft delete (não exclui permanentemente)
- ✅ Criptografia em trânsito (Firebase)

**Permissões:**
```typescript
// Firestore Security Rules
match /pacientes/{pacienteId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null && 
                  request.auth.token.role in ['admin', 'atendente'];
  allow delete: if request.auth != null && 
                  request.auth.token.role == 'admin';
}
```

---

## 📞 Suporte

Para dúvidas sobre o módulo de pacientes:
1. Consulte este README
2. Verifique `/requisitos_pacientes.md`
3. Revise o código-fonte com JSDoc
4. Consulte testes para exemplos de uso

---

**Última atualização:** Janeiro 2026  
**Versão:** 2.0.0 (Refatorado)
