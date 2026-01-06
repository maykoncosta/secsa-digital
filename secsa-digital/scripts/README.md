# 🔧 Scripts de Seed - SECSA Digital

Scripts utilitários para popular o banco de dados Firebase com dados iniciais.

---

## 📋 Pré-requisitos

### 1. Instalar Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Obter Credenciais do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem)
4. Aba **Contas de Serviço**
5. Clique em **Gerar nova chave privada**
6. Baixe o arquivo JSON

### 3. Configurar Credenciais

**Opção A: Usar arquivo JSON (Recomendado)**

Salve o arquivo baixado como `firebase-credentials.json` na pasta `scripts/` e edite o script:

```javascript
const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

**Opção B: Variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
FIREBASE_PROJECT_ID=seu-project-id
FIREBASE_CLIENT_EMAIL=seu-email@....iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

E ajuste o script:

```javascript
require('dotenv').config();

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};
```

---

## 🔬 Scripts Disponíveis

### `seed-hemograma.js`

Cria o schema completo do **Hemograma Completo** no Firebase.

**Execução:**

```bash
node scripts/seed-hemograma.js
```

**O que cria:**
- ✅ 25 parâmetros do hemograma
- ✅ 3 grupos: Série Vermelha, Série Branca, Plaquetas
- ✅ Parâmetros calculados (VCM, HCM, CHCM, valores absolutos)
- ✅ Validações de mínimo e máximo

**Exemplo de saída:**

```
🔬 Criando Schema de Hemograma Completo...

✅ Schema criado com sucesso!
📄 ID do documento: abc123def456
📊 Parâmetros criados: 25

Detalhes dos grupos:
  - Série Vermelha: 7 parâmetros
  - Série Branca: 16 parâmetros
  - Plaquetas: 2 parâmetros

🎉 Seed concluído com sucesso!
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**

- **NUNCA** comite o arquivo `firebase-credentials.json` no Git
- **NUNCA** comite chaves privadas diretamente no código
- Adicione ao `.gitignore`:

```gitignore
# Firebase
firebase-credentials.json
scripts/.env
scripts/**/*.json
!scripts/package.json
```

---

## 📚 Estrutura dos Parâmetros

Cada parâmetro segue a estrutura:

```javascript
{
  id: string,              // Identificador único (snake_case)
  label: string,           // Nome legível
  unidade: string,         // Ex: "g/dL", "%", "/mm³"
  tipo: "number" | "text", // Tipo de dado
  obrigatorio: boolean,    // Se é obrigatório
  grupo: string,           // Agrupamento visual
  isCalculado: boolean,    // Se é calculado por fórmula
  formula?: string,        // Fórmula de cálculo (se aplicável)
  min?: number,           // Valor mínimo aceitável
  max?: number            // Valor máximo aceitável
}
```

---

## 🎯 Próximos Schemas

Crie novos scripts para outros exames:

- `seed-lipidograma.js` - Colesterol, Triglicerídeos, HDL, LDL
- `seed-glicemia.js` - Glicose de jejum
- `seed-funcao-renal.js` - Ureia, Creatinina
- `seed-funcao-hepatica.js` - TGO, TGP, Bilirrubinas

---

## 🐛 Troubleshooting

### Erro de autenticação

```
Error: Could not load the default credentials
```

**Solução:** Verifique se as credenciais estão corretas e se o arquivo JSON está no caminho certo.

### Erro de permissão

```
Error: Missing or insufficient permissions
```

**Solução:** Verifique se a conta de serviço tem permissões de escrita no Firestore.

### Parâmetros não aparecem no sistema

**Solução:** Verifique se a coleção criada é `schemas-exames` (plural) e se os campos estão corretos.

---

<div align="center">
  <p>🏥 SECSA Digital • Scripts de Seed</p>
</div>
