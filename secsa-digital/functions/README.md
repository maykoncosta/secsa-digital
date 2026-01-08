# Cloud Functions - SECSA Digital

Este diretório contém as Cloud Functions para o SECSA Digital, responsáveis por manter as estatísticas do sistema atualizadas em tempo real.

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Firebase CLI instalado globalmente: `npm install -g firebase-tools`
- Plano Blaze (Pay as you go) do Firebase
- Projeto Firebase configurado

## 🚀 Setup Inicial

### 1. Instalar Dependências

```bash
cd functions
npm install
```

### 2. Fazer Login no Firebase

```bash
firebase login
```

### 3. Selecionar o Projeto

```bash
firebase use --add
# Selecione seu projeto Firebase
```

### 4. Atualizar Firestore Rules

As regras do Firestore já estão configuradas em `firestore.rules` para:
- Permitir leitura das coleções `estatisticas` e `top-exames` para usuários autenticados
- Permitir escrita APENAS para Cloud Functions (usuários não podem alterar)

```bash
firebase deploy --only firestore:rules
```

## 📊 Coleções de Estatísticas

### Collection: `estatisticas`

Documento único: `geral`

```typescript
{
  totalExames: number,
  exames_pendente: number,
  exames_finalizado: number,
  exames_liberado: number,
  examesHoje: number,
  totalPacientes: number,
  ultimaAtualizacao: Timestamp
}
```

### Collection: `top-exames`

Documentos com ID = `schemaId` do exame

```typescript
{
  nome: string,
  quantidade: number
}
```

## 🔥 Cloud Functions Disponíveis

### Triggers Automáticos

#### `onExameCreated`
- **Dispara**: Quando um novo exame é criado
- **Ação**: 
  - Incrementa `totalExames`
  - Incrementa contador do status (`exames_pendente`, etc)
  - Incrementa `examesHoje` se for exame de hoje
  - Atualiza contador do exame no `top-exames`

#### `onExameUpdated`
- **Dispara**: Quando um exame é atualizado
- **Ação**: 
  - Se o status mudou, ajusta os contadores
  - Decrementa status antigo
  - Incrementa novo status

#### `onExameDeleted`
- **Dispara**: Quando um exame é excluído
- **Ação**: 
  - Decrementa `totalExames`
  - Decrementa contador do status
  - Decrementa `examesHoje` se aplicável
  - Decrementa contador no `top-exames`

#### `onPacienteCreated`
- **Dispara**: Quando um novo paciente é criado
- **Ação**: Incrementa `totalPacientes`

#### `onPacienteDeleted`
- **Dispara**: Quando um paciente é excluído
- **Ação**: Decrementa `totalPacientes`

### Função HTTP

#### `initializeStats`
- **Tipo**: HTTP Request
- **Uso**: Inicializar/resetar estatísticas
- **Endpoint**: `https://<region>-<project-id>.cloudfunctions.net/initializeStats`

Esta função percorre todos os exames e pacientes existentes e calcula as estatísticas do zero. Use para:
- Migração inicial (primeira vez que implementa as Cloud Functions)
- Resetar estatísticas após inconsistências
- Sincronizar dados após importação em massa

## 📦 Deploy

### Deploy Completo

```bash
# Deploy das functions e regras
firebase deploy
```

### Deploy Apenas Functions

```bash
firebase deploy --only functions
```

### Deploy de uma Function Específica

```bash
firebase deploy --only functions:onExameCreated
```

## 🔧 Inicialização das Estatísticas

**IMPORTANTE**: Na primeira vez que fizer o deploy, você precisa inicializar as estatísticas:

### Opção 1: Via HTTP Request

```bash
# Obter URL da função
firebase functions:config:get

# Fazer request (substitua pela URL do seu projeto)
curl https://us-central1-seu-projeto.cloudfunctions.net/initializeStats
```

### Opção 2: Via Console Firebase

1. Acesse o Console Firebase
2. Vá em Functions
3. Localize `initializeStats`
4. Clique em "Testing" e execute

### Opção 3: Via Postman/Insomnia

```
GET https://us-central1-seu-projeto.cloudfunctions.net/initializeStats
```

A resposta será algo como:

```json
{
  "success": true,
  "message": "Estatísticas inicializadas com sucesso",
  "stats": {
    "totalExames": 150,
    "examesPendentes": 23,
    "examesFinalizados": 50,
    "examesLiberados": 77,
    "examesHoje": 5,
    "totalPacientes": 89,
    "topExames": 12
  }
}
```

## 🧪 Testes Locais

### Emulador Firebase

```bash
cd functions
npm run serve
```

Isso iniciará o emulador local. Configure o Angular para usar o emulador:

```typescript
// src/environments/environment.ts
export const environment = {
  useEmulator: true,
  emulatorConfig: {
    firestore: ['localhost', 8080],
    functions: ['localhost', 5001]
  }
};
```

## 📈 Monitoramento

### Ver Logs

```bash
# Logs em tempo real
firebase functions:log

# Logs de uma função específica
firebase functions:log --only onExameCreated
```

### Console Firebase

1. Acesse Console Firebase > Functions
2. Veja execuções, erros e métricas
3. Configure alertas para falhas

## 💰 Custos

As Cloud Functions no plano Blaze têm os seguintes limites gratuitos mensais:
- 2 milhões de invocações
- 400.000 GB-segundos de tempo de computação
- 200.000 GB-segundos de memória
- 5 GB de tráfego de saída

Para um sistema com ~1000 exames/mês:
- ~3000 invocações (CREATE, UPDATE, DELETE)
- Custo estimado: **< $0.10/mês**

## 🔍 Troubleshooting

### Estatísticas não estão atualizando

1. Verifique se as functions foram deployadas:
   ```bash
   firebase functions:list
   ```

2. Verifique os logs:
   ```bash
   firebase functions:log
   ```

3. Re-inicialize as estatísticas:
   ```bash
   curl https://sua-funcao.cloudfunctions.net/initializeStats
   ```

### Permissões negadas

- Verifique se o Firestore Rules foi deployado
- Confirme que o usuário está autenticado
- Verifique se o Firebase está no plano Blaze

### Functions não aparecem no Console

- Aguarde 2-3 minutos após o deploy
- Verifique se não há erros de build:
  ```bash
  cd functions
  npm run build
  ```

## 🔐 Segurança

- ✅ Apenas Cloud Functions podem escrever em `estatisticas` e `top-exames`
- ✅ Usuários autenticados podem apenas LER essas coleções
- ✅ Validações de tipo via TypeScript
- ✅ Logs automáticos de todas as operações

## 📚 Referências

- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## 🎯 Próximos Passos

Após o deploy:

1. ✅ Executar `initializeStats` para popular dados iniciais
2. ✅ Verificar no Console Firebase se as functions estão ativas
3. ✅ Testar criando/editando/excluindo exames e verificar se estatísticas atualizam
4. ✅ Configurar alertas no Console Firebase para monitorar erros
