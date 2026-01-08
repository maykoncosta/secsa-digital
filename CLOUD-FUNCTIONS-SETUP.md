# Setup Cloud Functions - Guia Rápido

## 🎯 O que mudou?

O Dashboard agora usa **estatísticas em tempo real** mantidas por Cloud Functions, ao invés de carregar todos os exames na memória.

### Vantagens:
- ⚡ **Performance**: Dashboard carrega instantaneamente mesmo com 100.000+ exames
- 🔄 **Tempo Real**: Estatísticas atualizam automaticamente quando dados mudam
- 💰 **Custo**: Reduz drasticamente leituras do Firestore
- 📊 **Escalabilidade**: Funciona com qualquer volume de dados

## 📋 Checklist de Implementação

### 1. Upgrade do Firebase (OBRIGATÓRIO)

```bash
# O projeto precisa estar no plano Blaze (Pay as you go)
# Acesse: https://console.firebase.google.com
# Vá em: Settings > Usage and billing > Modify plan
```

**Custo estimado mensal**: < $0.10 para sistemas pequenos/médios

### 2. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 3. Autenticar

```bash
firebase login
```

### 4. Configurar Projeto

```bash
# Na raiz do projeto (c:\projetos\secsa-digital)
firebase use --add
# Selecione seu projeto quando solicitado
```

### 5. Instalar Dependências das Functions

```bash
cd functions
npm install
```

### 6. Deploy

```bash
# Voltar para raiz
cd ..

# Deploy completo (functions + regras)
firebase deploy
```

### 7. Inicializar Estatísticas

**IMPORTANTE**: Execute isso UMA VEZ após o primeiro deploy:

```bash
# A URL será exibida após o deploy
# Exemplo: https://us-central1-seu-projeto.cloudfunctions.net/initializeStats

curl https://SUA-REGIAO-SEU-PROJETO.cloudfunctions.net/initializeStats
```

Ou acesse a URL no navegador.

## ✅ Verificação

Após o deploy, verifique:

1. **Console Firebase > Functions**: Deve mostrar 6 functions ativas
   - onExameCreated
   - onExameUpdated
   - onExameDeleted
   - onPacienteCreated
   - onPacienteDeleted
   - initializeStats

2. **Console Firebase > Firestore**: Deve ter 2 novas collections
   - `estatisticas` (documento: `geral`)
   - `top-exames` (vários documentos)

3. **Dashboard**: Deve carregar instantaneamente com estatísticas corretas

## 🧪 Testar

1. Crie um novo exame
2. Veja o dashboard atualizar automaticamente
3. Mude o status do exame
4. Veja o dashboard refletir a mudança
5. Exclua um exame pendente
6. Veja os números atualizarem

## 🔧 Ambiente de Desenvolvimento

Para testar localmente sem custos:

```bash
cd functions
npm run serve
```

Configure o Angular para usar emulador (opcional):

```typescript
// src/environments/environment.ts
export const environment = {
  useEmulator: true, // Apenas em desenvolvimento
  // ... resto da config
};
```

## 📊 Estrutura das Estatísticas

### Collection: `estatisticas/geral`
```json
{
  "totalExames": 1234,
  "exames_pendente": 45,
  "exames_finalizado": 189,
  "exames_liberado": 1000,
  "examesHoje": 12,
  "totalPacientes": 567,
  "ultimaAtualizacao": "2026-01-07T10:30:00Z"
}
```

### Collection: `top-exames/{schemaId}`
```json
{
  "nome": "Hemograma Completo",
  "quantidade": 450
}
```

## ⚠️ Problemas Comuns

### "Functions requires billing to be enabled"
- Projeto precisa estar no plano Blaze
- Não há cobrança até ultrapassar limites gratuitos generosos

### "Permission denied"
- Execute: `firebase deploy --only firestore:rules`
- Verifique autenticação do usuário no Angular

### "Statistics not updating"
- Execute `initializeStats` novamente
- Verifique logs: `firebase functions:log`

### "Build errors in functions"
- `cd functions && npm run build`
- Corrija erros TypeScript antes do deploy

## 📞 Suporte

Consulte:
- [functions/README.md](functions/README.md) - Documentação completa
- [Firebase Docs](https://firebase.google.com/docs/functions)
- Logs: `firebase functions:log`

## 🎉 Pronto!

Seu dashboard agora usa estatísticas em tempo real e escala infinitamente! 🚀
