# 🔐 Configurando Permissões do Firebase

## Erro: "Missing or insufficient permissions"

Este erro ocorre quando as regras do Firestore não permitem que o script escreva dados no banco.

---

## ✅ Solução Rápida (Desenvolvimento)

### 1. Acesse o Firebase Console

🔗 https://console.firebase.google.com/

### 2. Selecione seu projeto

`secsa-digital`

### 3. Navegue até Firestore Database

- No menu lateral, clique em **"Firestore Database"**
- Clique na aba **"Regras"**

### 4. Configure as regras para desenvolvimento

Cole o seguinte código:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // APENAS PARA DESENVOLVIMENTO
    }
  }
}
```

### 5. Publique as regras

- Clique em **"Publicar"**
- Aguarde alguns segundos

### 6. Execute o script novamente

```bash
node scripts/seed-hemograma.js
```

---

## 🔒 Regras de Produção (Após popular o banco)

⚠️ **IMPORTANTE:** As regras acima permitem acesso total ao banco. Use apenas em desenvolvimento!

### Regras Recomendadas para Produção

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regras para schemas de exames
    match /schemas-exames/{schemaId} {
      // Leitura: apenas usuários autenticados
      allow read: if request.auth != null;
      
      // Escrita: apenas administradores
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para pacientes
    match /pacientes/{pacienteId} {
      // Leitura: usuários autenticados
      allow read: if request.auth != null;
      
      // Escrita: usuários autenticados
      allow create, update: if request.auth != null;
      
      // Exclusão: apenas administradores
      allow delete: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Regras para exames realizados
    match /exames-realizados/{exameId} {
      allow read, write: if request.auth != null;
    }
    
    // Bloquear acesso a todas as outras coleções
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🧪 Testando as Regras

### No Firebase Console

1. Vá em **Firestore Database > Regras**
2. Clique em **"Playground de regras"**
3. Teste diferentes cenários

### Exemplo de teste:

```javascript
// Simulação
Tipo: get
Local: /databases/(default)/documents/schemas-exames/abc123
Autenticação: Provedor personalizado
User ID: user123
```

---

## 📚 Documentação Oficial

- [Security Rules do Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Teste de regras](https://firebase.google.com/docs/firestore/security/test-rules-emulator)
- [Exemplos de regras](https://firebase.google.com/docs/firestore/security/rules-conditions)

---

## 🆘 Troubleshooting

### Erro persiste após publicar regras

1. Aguarde 1-2 minutos para propagação
2. Limpe o cache do navegador
3. Verifique se está no projeto correto
4. Tente fazer logout/login no Firebase Console

### Erro em produção com autenticação

Verifique se:
- O usuário está autenticado (`request.auth != null`)
- O token não expirou
- As regras estão verificando os campos corretos

### Preciso resetar as regras?

Sim, você pode clicar em **"Descartar"** para voltar às regras anteriores antes de publicar.

---

<div align="center">
  <p>🏥 SECSA Digital • Guia de Permissões</p>
  <p>Após popular o banco, lembre-se de configurar regras de segurança apropriadas!</p>
</div>
