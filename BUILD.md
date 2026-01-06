# 🔧 Guia de Build e Validação - SECSA Digital

## ✅ Status da Refatoração

**Data:** Janeiro 2026  
**Status:** ✅ Concluído  
**Arquivos movidos:** 7 componentes  
**Arquivos atualizados:** 9 arquivos  
**Documentos criados:** 4 arquivos  

---

## 📋 Checklist Pré-Build

Antes de fazer o build, verifique:

- [x] Todos os arquivos foram movidos para as novas pastas
- [x] Todos os imports foram atualizados
- [x] Rotas foram atualizadas no `app.routes.ts`
- [x] Sem erros de compilação no VSCode
- [x] Documentação criada e completa

---

## 🚀 Comandos para Build e Teste

### 1. Instalar Dependências (se necessário)
```powershell
cd c:\projetos\secsa-digital\secsa-digital
npm install --legacy-peer-deps
```

### 2. Verificar Erros de Compilação
```powershell
# Compilar TypeScript sem executar
npx ng build --configuration development --no-aot
```

### 3. Executar em Modo de Desenvolvimento
```powershell
# Iniciar servidor de desenvolvimento
npx ng serve

# Ou com porta específica
npx ng serve --port 4200
```

### 4. Build de Produção
```powershell
# Build otimizado para produção
npx ng build --configuration production

# Output em: dist/secsa-digital/
```

### 5. Executar Testes (quando implementados)
```powershell
# Testes unitários
npx ng test

# Testes E2E
npx ng e2e
```

---

## 🔍 Verificação de Integridade

### Verificar Estrutura de Arquivos
```powershell
# Listar estrutura do módulo de exames
Get-ChildItem "c:\projetos\secsa-digital\secsa-digital\src\app\features\exames" -Recurse | 
  Select-Object FullName | 
  ForEach-Object { $_.FullName.Replace("c:\projetos\secsa-digital\secsa-digital\src\app\features\exames\", "  ") }
```

**Resultado esperado:**
```
  exames.component.ts
  README.md
  pages\exames-realizados-list.component.ts
  pages\schemas-exames-list.component.ts
  components\modals\exame-realizado-form-modal.component.ts
  components\modals\lancar-resultados-modal.component.ts
  components\modals\schema-exame-edit-modal.component.ts
  components\modals\schema-exame-form-modal.component.ts
  components\modals\visualizar-resultado-modal.component.ts
```

### Verificar Imports
```powershell
# Verificar se ainda há imports antigos
Select-String -Path "c:\projetos\secsa-digital\secsa-digital\src\app\features\exames\**\*.ts" `
  -Pattern "from '\.\/(exames-realizados|schemas-exames|.*-modal)" `
  -List
```

**Resultado esperado:** Nenhum resultado (todos os imports foram atualizados)

### Verificar Erros de TypeScript
```powershell
# Verificar erros em todos os arquivos do módulo
npx tsc --noEmit --project tsconfig.json
```

---

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: Erro de Import Não Encontrado
**Sintoma:**
```
Cannot find module '../components/modals/...'
```

**Solução:**
```powershell
# 1. Verificar se o arquivo existe no local correto
Test-Path "c:\projetos\secsa-digital\secsa-digital\src\app\features\exames\components\modals\*.ts"

# 2. Verificar se o import está usando o caminho correto
# Dentro de pages/: '../components/modals/...'
# Dentro de modals/: './...' ou '../*.component'
```

### Problema 2: Erro de Circular Dependency
**Sintoma:**
```
WARNING in Circular dependency detected
```

**Solução:**
- Verificar se há imports circulares
- Mover interfaces compartilhadas para `/data/interfaces/`
- Usar barrel exports (`index.ts`) com cuidado

### Problema 3: Módulo não Carrega (404)
**Sintoma:**
```
Cannot match any routes. URL Segment: 'exames/schemas'
```

**Solução:**
```typescript
// Verificar app.routes.ts
{
  path: 'exames/schemas',
  loadComponent: () => import('./features/exames/pages/schemas-exames-list.component')
    .then(m => m.SchemasExamesListComponent)
}
```

### Problema 4: CSS/Tailwind não Funciona
**Sintoma:**
- Estilos não são aplicados

**Solução:**
```powershell
# Reconstruir CSS do Tailwind
npm run build:css

# Ou reiniciar servidor
npx ng serve
```

---

## 🧪 Testes Manuais Recomendados

Após o build, testar manualmente:

### 1. Navegação
- [ ] Acessar `/exames/schemas`
- [ ] Acessar `/exames/realizados`
- [ ] Navegar entre as abas

### 2. Schemas de Exames
- [ ] Listar schemas
- [ ] Criar novo schema
- [ ] Editar valores de referência
- [ ] Filtrar por categoria
- [ ] Ativar/Inativar schema

### 3. Exames Realizados
- [ ] Listar exames
- [ ] Criar novo exame
- [ ] Lançar resultados
- [ ] Visualizar resultado
- [ ] Gerar PDF
- [ ] Filtrar por status

### 4. Modais
- [ ] Todos os modais abrem corretamente
- [ ] Backdrop fecha modal
- [ ] Botão X fecha modal
- [ ] Formulários salvam dados
- [ ] Validações funcionam

---

## 📊 Métricas de Build

### Build de Desenvolvimento
```
Tempo esperado: ~30s
Tamanho: ~5-10 MB
```

### Build de Produção
```
Tempo esperado: ~60-90s
Tamanho otimizado: ~1-2 MB (com lazy loading)
```

### Performance
```
Lighthouse Score esperado:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
```

---

## 🔄 Rollback (se necessário)

Caso algo dê errado, você pode fazer rollback usando Git:

```powershell
# Ver últimos commits
git log --oneline -10

# Reverter para commit anterior
git revert HEAD

# Ou resetar (cuidado!)
git reset --hard HEAD~1
```

**Nota:** Como os arquivos foram movidos mas não deletados do Git ainda, 
é possível recuperar a estrutura antiga se necessário.

---

## ✅ Validação Final

Execute esses comandos para validar:

```powershell
# 1. Compilação sem erros
npx ng build --configuration development

# 2. Verificar warnings
# (alguns warnings de linting são ok, mas não deve ter erros)

# 3. Executar em dev
npx ng serve

# 4. Abrir browser
Start-Process "http://localhost:4200"

# 5. Testar funcionalidades principais
```

---

## 📝 Próximos Passos Após Build

1. **Commit das Mudanças**
```powershell
git add .
git commit -m "refactor(exames): reorganizar módulo em pages e components

- Mover componentes de lista para pages/
- Mover modais para components/modals/
- Atualizar todos os imports
- Adicionar documentação completa
- Criar guias de melhoria e estrutura"
```

2. **Push para Repositório**
```powershell
git push origin main
```

3. **Criar Tag de Versão**
```powershell
git tag -a v2.0.0 -m "Refatoração do módulo de exames"
git push origin v2.0.0
```

4. **Atualizar Documentação**
- Revisar MELHORIAS.md
- Atualizar CHANGELOG (se existir)
- Comunicar time sobre mudanças

---

## 🎯 Critérios de Sucesso

A refatoração está completa quando:

- ✅ Build compila sem erros
- ✅ Aplicação roda sem warnings críticos
- ✅ Todas as funcionalidades continuam operacionais
- ✅ Testes manuais passam
- ✅ Performance mantida ou melhorada
- ✅ Código mais organizado e legível
- ✅ Documentação completa

---

## 📞 Suporte

Em caso de problemas:

1. Verificar este guia
2. Consultar `/MELHORIAS.md` - Seção "Problemas e Soluções"
3. Verificar logs de compilação
4. Revisar imports nos arquivos movidos
5. Verificar se todos os arquivos foram movidos corretamente

---

<div align="center">
  <h3>✅ Build e Validação - Checklist Completo</h3>
  <p><strong>SECSA Digital v2.0.0</strong></p>
  <p>Janeiro 2026</p>
</div>
