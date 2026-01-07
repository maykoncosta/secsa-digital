# Guia de Instalação - Integração Sentry

## ✅ Implementação Completa

A integração com Sentry está **totalmente implementada** no código. Falta apenas:
1. Instalar o pacote
2. Configurar o DSN
3. Ativar o Sentry

## 📦 Passo 1: Instalar Pacote

```bash
cd secsa-digital
npm install @sentry/angular
```

## 🔑 Passo 2: Obter DSN do Sentry

### 2.1. Criar Conta
1. Acesse: https://sentry.io/signup/
2. Crie uma conta gratuita (5.000 erros/mês)

### 2.2. Criar Projeto
1. No dashboard, clique em "Create Project"
2. Selecione plataforma: **Angular**
3. Nome do projeto: **SECSA Digital**
4. Alert frequency: **Default**
5. Clique em "Create Project"

### 2.3. Copiar DSN
1. Após criar o projeto, você verá o DSN
2. Formato: `https://abc123@o123456.ingest.sentry.io/123456`
3. Copie este valor

## ⚙️ Passo 3: Configurar DSN

### 3.1. Ambiente de Desenvolvimento
Arquivo: `src/environments/environment.ts`

```typescript
sentry: {
  dsn: 'COLE_SEU_DSN_AQUI', // ← Cole o DSN copiado
  enabled: true,              // ← Mude para true
  environment: 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
}
```

### 3.2. Ambiente de Produção
Arquivo: `src/environments/environment.prod.ts`

```typescript
sentry: {
  dsn: 'COLE_SEU_DSN_AQUI', // ← Cole o mesmo DSN
  enabled: true,
  environment: 'production',
  tracesSampleRate: 0.1,    // 10% em produção
  replaysSessionSampleRate: 0.01,  // 1% em produção
  replaysOnErrorSampleRate: 1.0
}
```

## 🧪 Passo 4: Testar Integração

### 4.1. Iniciar Aplicação
```bash
npm start
```

### 4.2. Acessar Página de Testes
```
http://localhost:4200/dashboard/error-test
```

### 4.3. Disparar Erros
Clique nos botões:
- ❌ Erro Síncrono
- ⏱️ Erro Assíncrono
- 🔍 Erro de Acesso
- ⏰ Erro Tardio

### 4.4. Verificar no Sentry
1. Acesse: https://sentry.io
2. Vá para seu projeto "SECSA Digital"
3. Clique em "Issues"
4. Você verá os erros capturados com:
   - ✅ Stack trace completo
   - ✅ Navegador e sistema operacional
   - ✅ Timestamp
   - ✅ Contexto adicional

## 📊 Passo 5: Visualizar Logs Locais

### 5.1. Acessar Dashboard de Erros
```
http://localhost:4200/dashboard/error-logs
```

### 5.2. Funcionalidades
- 📈 Estatísticas (Total, Críticos, Alto, Taxa de sucesso)
- 📋 Lista de erros com severidade
- 🔍 Stack trace expandível
- 📤 Botão "Enviar para Sentry" (envia últimos 10 erros)
- 💾 Exportar JSON/CSV

## 🎯 Recursos Implementados

### ✅ Captura Automática
- [x] Erros síncronos (throw)
- [x] Erros assíncronos (Promise rejections)
- [x] Erros não tratados (window.error)
- [x] Erros HTTP
- [x] Erros do Firebase

### ✅ Contexto Enriquecido
- [x] Stack trace
- [x] User agent
- [x] Timestamp
- [x] Tipo de erro
- [x] Severidade (low/medium/high/critical)
- [x] Contexto customizado

### ✅ Integrações
- [x] **Sentry** - Totalmente integrado
- [ ] LogRocket - Placeholder implementado
- [ ] Custom Server - Placeholder implementado
- [ ] Email - Placeholder implementado

### ✅ UI/UX
- [x] Toast de erro para usuário
- [x] Error boundary com fallback UI
- [x] Dashboard de logs
- [x] Exportação (JSON/CSV)
- [x] Indicador de loading
- [x] Skeleton loaders

## 🔧 Configurações Avançadas

### Filtrar Erros Específicos
Edite `app.config.ts` na função `beforeSend`:

```typescript
beforeSend(event, hint) {
  const error = hint.originalException;
  
  // Exemplo: Ignorar erros de rede
  if (error instanceof Error && error.message.includes('NetworkError')) {
    return null;
  }
  
  return event;
}
```

### Adicionar Contexto de Usuário
No serviço de autenticação:

```typescript
import * as Sentry from '@sentry/angular';

login(user: User) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.nome
  });
}

logout() {
  Sentry.setUser(null);
}
```

### Captura Manual
```typescript
import * as Sentry from '@sentry/angular';

// Capturar exceção
try {
  // código
} catch (error) {
  Sentry.captureException(error);
}

// Capturar mensagem
Sentry.captureMessage('Operação importante executada', 'info');

// Adicionar breadcrumb
Sentry.addBreadcrumb({
  category: 'exame',
  message: 'Usuário criou exame',
  level: 'info'
});
```

## 📈 Limites do Plano Gratuito

- **5.000 erros/mês**
- **10.000 session replays/mês**
- **30 dias de retenção**
- **1 membro da equipe**

## 🆘 Solução de Problemas

### Erros não aparecem no Sentry
1. ✅ Verificar se `sentry.enabled = true`
2. ✅ Verificar se DSN está correto
3. ✅ Verificar console do navegador (erros de inicialização)
4. ✅ Verificar filtros em `beforeSend`

### "Sentry is not defined"
```bash
# Reinstalar o pacote
npm uninstall @sentry/angular
npm install @sentry/angular
```

### Erro de compilação TypeScript
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentação Oficial

- Sentry Angular: https://docs.sentry.io/platforms/javascript/guides/angular/
- Sentry Dashboard: https://sentry.io/
- API Reference: https://docs.sentry.io/platforms/javascript/

## ✅ Checklist Final

- [ ] Pacote `@sentry/angular` instalado
- [ ] DSN configurado em `environment.ts`
- [ ] DSN configurado em `environment.prod.ts`
- [ ] `sentry.enabled = true` em ambos os arquivos
- [ ] Aplicação rodando sem erros de compilação
- [ ] Testado em `/dashboard/error-test`
- [ ] Erros visíveis no dashboard do Sentry
- [ ] Dashboard local funcionando em `/dashboard/error-logs`

---

**🎉 Pronto!** Seu sistema está com monitoramento de erros profissional implementado.
