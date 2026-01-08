# Comandos de Deploy - Cloud Functions

## Setup Inicial (executar apenas uma vez)

```powershell
# 1. Instalar Firebase CLI globalmente
npm install -g firebase-tools

# 2. Fazer login no Firebase
firebase login

# 3. Na raiz do projeto, vincular ao seu projeto Firebase
firebase use --add
# Selecione seu projeto quando solicitado
```

## Instalar Dependências

```powershell
# Entrar na pasta functions
cd functions

# Instalar dependências
npm install

# Voltar para raiz
cd ..
```

## Deploy

```powershell
# Deploy completo (functions + firestore rules + hosting)
firebase deploy

# Ou deploy apenas das functions
firebase deploy --only functions

# Ou deploy apenas das regras do Firestore
firebase deploy --only firestore:rules
```

## Inicializar Estatísticas (IMPORTANTE!)

Após o primeiro deploy, execute UMA VEZ:

```powershell
# A URL será algo como:
# https://us-central1-SEU-PROJETO.cloudfunctions.net/initializeStats

# Fazer request HTTP
Invoke-WebRequest -Uri "https://SUA-REGIAO-SEU-PROJETO.cloudfunctions.net/initializeStats"

# Ou abra a URL no navegador
```

## Comandos Úteis

```powershell
# Listar functions deployadas
firebase functions:list

# Ver logs em tempo real
firebase functions:log

# Ver logs de uma function específica
firebase functions:log --only onExameCreated

# Testar localmente com emulador
cd functions
npm run serve

# Build local para verificar erros
cd functions
npm run build
```

## Verificar Status

```powershell
# Ver projeto atual
firebase use

# Ver configurações
firebase functions:config:get

# Ver uso (quota)
firebase projects:list
```

## Troubleshooting

```powershell
# Se houver erros de TypeScript
cd functions
npm run build

# Se as functions não aparecerem
firebase functions:list

# Verificar se está no projeto correto
firebase use

# Re-deploy forçado
firebase deploy --only functions --force
```

## Estrutura de URLs

Após o deploy, suas functions estarão disponíveis em:

```
https://[REGION]-[PROJECT-ID].cloudfunctions.net/[FUNCTION-NAME]

Exemplo:
https://us-central1-secsa-digital-2024.cloudfunctions.net/initializeStats
```

## Custos

Limites gratuitos mensais (Plano Blaze):
- 2.000.000 invocações
- 400.000 GB-segundo de computação
- 200.000 GB-segundo de memória
- 5 GB de saída de rede

Estimativa para 1000 exames/mês: **< $0.10**
