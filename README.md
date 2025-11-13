# SECSA Digital

Sistema de gerenciamento de exames laboratoriais para o SUS (Sistema Único de Saúde).

## 📋 Sobre o Projeto

SECSA Digital é uma aplicação web desenvolvida para facilitar o gerenciamento de pacientes e exames laboratoriais em estabelecimentos de saúde que atendem pelo SUS. O sistema oferece:

- Cadastro e gerenciamento de pacientes (com CPF e CNS)
- Registro de exames laboratoriais (Hemograma, Urina, Fezes)
- Comparação automática com valores de referência
- Interface intuitiva para bioquímicos
- Integração com Firebase/Firestore

## 🚀 Tecnologias

- **Angular 19.0.0** - Framework frontend
- **TypeScript 5.6.3** - Linguagem de programação
- **Firebase 11.0.2** - Backend as a Service
  - Firestore - Banco de dados NoSQL
  - Authentication - Autenticação (planejado)
  - Cloud Functions - Funções serverless (planejado)
- **SCSS** - Estilização
- **date-fns 4.1.0** - Manipulação de datas

## 📦 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Conta no Firebase

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd secsa-digital
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Copie os arquivos de exemplo:
     ```bash
     cp src/environments/environment.example.ts src/environments/environment.ts
     cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
     ```
   - Preencha os arquivos com suas credenciais do Firebase

4. Configure o Firestore:
   - Acesse o Firebase Console
   - Crie um banco de dados Firestore em modo de teste
   - As coleções serão criadas automaticamente ao usar o sistema

5. Popule os valores de referência (execute apenas uma vez):
```bash
npx ts-node src/app/scripts/popular-valores-referencia.ts
```

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
npm start
# ou
ng serve
```

Acesse `http://localhost:4200`

### Build de Produção

```bash
npm run build
# ou
ng build --configuration production
```

Os arquivos de build estarão em `dist/`

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── core/
│   │   ├── models/           # Interfaces TypeScript
│   │   └── services/         # Serviços compartilhados
│   ├── features/
│   │   └── bioquimico/       # Módulo do bioquímico
│   │       ├── components/
│   │       │   ├── cadastro-paciente/
│   │       │   ├── lista-pacientes/
│   │       │   ├── detalhes-paciente/
│   │       │   ├── cadastro-exame/
│   │       │   └── lista-exames/
│   │       ├── services/
│   │       └── layout/
│   ├── shared/
│   │   └── pipes/            # Pipes reutilizáveis
│   ├── scripts/              # Scripts utilitários
│   └── assets/
│       └── styles/           # Estilos globais
├── environments/             # Configurações por ambiente
└── styles.scss              # Estilos globais
```

## 🎯 Funcionalidades Implementadas

### Fase 1 - Base ✅
- Configuração do projeto Angular + Firebase
- Modelos de dados (7 interfaces)
- Serviço genérico Firestore
- Pipes de formatação (CPF, CNS, Telefone)
- Sistema de estilos com variáveis SCSS

### Fase 2 - Módulo de Pacientes ✅
- Cadastro de pacientes com validações
  - CPF e CNS com validação de algoritmo oficial
  - Verificação de unicidade assíncrona
  - Campo de sexo (M/F) obrigatório
  - Endereço completo com UF (select)
- Listagem de pacientes
  - Busca com debounce
  - Filtros (nome, CPF, CNS)
  - Paginação (10 itens)
- Visualização de detalhes
- Edição de pacientes
- Desativação (soft delete)

### Fase 3 - Módulo de Exames ✅
- Cadastro de exames
  - Busca de paciente por nome
  - Seleção do tipo de exame (hemograma, urina, fezes)
  - Formulário dinâmico com 43 parâmetros
  - Comparação automática com valores de referência
  - Indicação visual de valores alterados
- Listagem de exames
  - Filtros por status, tipo e busca
  - Badges de status visual
  - Contador de valores alterados
  - Dias desde coleta
- Valores de referência
  - Diferenciados por sexo (M/F/ambos)
  - Faixas etárias (planejado)
  - 26 parâmetros cadastrados

### Fase 4 - Recursos Avançados (Planejado)
- Liberação de exames com PDF
- Autenticação (CPF/CNS + senha)
- Cloud Functions
- Regras de segurança Firestore
- Notificações

## 📊 Coleções do Firestore

1. **usuarios** - Pacientes e profissionais
2. **exames** - Exames laboratoriais
3. **valoresReferencia** - Parâmetros de referência
4. **auditoria** - Logs de ações (planejado)
5. **notificacoes** - Notificações do sistema (planejado)
6. **configuracoes** - Configurações globais (planejado)
7. **historico** - Histórico de alterações (planejado)

## 🔒 Segurança

- **IMPORTANTE**: Os arquivos `environment.ts` e `environment.prod.ts` contêm credenciais sensíveis e **não devem** ser commitados no Git
- Use os arquivos `.example.ts` como template
- Implemente as regras de segurança do Firestore antes de produção
- Configure autenticação antes de disponibilizar publicamente

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Documentação Adicional

Consulte os seguintes documentos na raiz do projeto:

- `REQUISITOS.md` - Requisitos funcionais e não-funcionais
- `REGRAS_NEGOCIO.md` - Regras de negócio detalhadas
- `MODELAGEM_FIREBASE.md` - Estrutura do banco de dados
- `VALORES_REFERENCIA.md` - Tabela de valores de referência
- `PLANO_IMPLEMENTACAO.md` - Roadmap de desenvolvimento
- `PROGRESSO.md` - Status de implementação

## 📄 Licença

Este projeto é proprietário e de uso interno.

## 👥 Autores

- Desenvolvimento inicial - SECSA Digital Team

## 📞 Suporte

Para questões e suporte, entre em contato através dos canais oficiais da instituição.
