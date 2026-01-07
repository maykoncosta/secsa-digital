# Configuração do Sentry

## 1. Instalar o Pacote

```bash
npm install @sentry/angular
```

## 2. Obter o DSN do Sentry

1. Acesse [https://sentry.io](https://sentry.io)
2. Crie uma conta gratuita (5.000 erros/mês)
3. Crie um novo projeto:
   - Platform: **Angular**
   - Nome: **SECSA Digital**
4. Copie o **DSN** fornecido (formato: `https://xxx@xxx.ingest.sentry.io/xxx`)

## 3. Configurar o DSN

### Desenvolvimento (`environment.ts`)
```typescript
sentry: {
  dsn: 'SEU_DSN_AQUI',
  enabled: false, // Mude para true quando quiser testar
  environment: 'development',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
}
```

### Produção (`environment.prod.ts`)
```typescript
sentry: {
  dsn: 'SEU_DSN_AQUI',
  enabled: true,
  environment: 'production',
  tracesSampleRate: 0.1, // 10% das transações
  replaysSessionSampleRate: 0.01, // 1% das sessões
  replaysOnErrorSampleRate: 1.0 // 100% quando há erro
}
```

## 4. Inicialização

O Sentry já está configurado em `app.config.ts` e será inicializado automaticamente quando `sentry.enabled = true`.

## 5. Testar a Integração

1. Configure o DSN nos arquivos de ambiente
2. Ative o Sentry (`enabled: true`)
3. Acesse `/dashboard/error-test` para disparar erros de teste
4. Verifique os erros no painel do Sentry

## 6. Recursos Configurados

- ✅ **Error Tracking**: Captura automática de todos os erros
- ✅ **Stack Traces**: Rastreamento completo da pilha de erros
- ✅ **Session Replay**: Reprodução de sessões com erros
- ✅ **Performance Monitoring**: Rastreamento de transações
- ✅ **User Context**: Informações do usuário quando disponível
- ✅ **Breadcrumbs**: Ações do usuário antes do erro

## 7. Envio Manual de Erros

```typescript
import * as Sentry from '@sentry/angular';

// Capturar erro
Sentry.captureException(new Error('Erro customizado'));

// Capturar mensagem
Sentry.captureMessage('Algo importante aconteceu', 'warning');

// Adicionar contexto
Sentry.setUser({ id: '123', email: 'usuario@example.com' });
Sentry.setTag('feature', 'exames');
Sentry.setContext('custom', { data: 'valor' });
```

## 8. Plano Gratuito

- **5.000 erros/mês**
- **10.000 session replays/mês**
- **Retenção de 30 dias**
- **1 membro da equipe**

Para mais informações: [Documentação do Sentry](https://docs.sentry.io/platforms/javascript/guides/angular/)
