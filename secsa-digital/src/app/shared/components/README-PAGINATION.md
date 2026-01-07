# Componente de Paginação Reutilizável

## Visão Geral
Componente standalone de paginação desenvolvido para ser reutilizado em todas as listas do sistema.

## Características
- ✅ Navegação completa (primeira, anterior, próxima, última página)
- ✅ Seletor de tamanho de página (10, 25, 50, 100 itens)
- ✅ Exibição de informação de resultados
- ✅ Números de página inteligentes com reticências
- ✅ Design responsivo com Tailwind CSS
- ✅ Ícones Lucide Angular
- ✅ Signals para reatividade

## Uso Básico

### 1. Importar no Componente

```typescript
import { PaginationComponent, PaginationConfig } from '../../../shared/components/pagination.component';

@Component({
  selector: 'app-minha-lista',
  imports: [
    CommonModule,
    PaginationComponent,
    // ... outros imports
  ],
  // ...
})
export class MinhaListaComponent {
  // Signals para controle de paginação
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  
  paginationConfig = signal<PaginationConfig>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });
}
```

### 2. Adicionar no Template

```html
<!-- Após sua tabela/lista -->
<app-pagination
  [config]="paginationConfig()"
  (pageChange)="onPageChange($event)"
  (pageSizeChange)="onPageSizeChange($event)"
/>
```

### 3. Implementar Métodos

```typescript
async loadItens(): Promise<void> {
  this.loading.set(true);
  try {
    const result = await this.repository.getPaginated(
      this.currentPage(),
      this.pageSize(),
      this.searchTerm // opcional
    );
    
    this.itens.set(result.items);
    this.totalItems.set(result.total);
    this.paginationConfig.set({
      currentPage: result.page,
      pageSize: result.pageSize,
      totalItems: result.total
    });
  } catch (error) {
    console.error('Erro ao carregar itens:', error);
    this.toastService.error('Erro ao carregar itens');
  } finally {
    this.loading.set(false);
  }
}

onPageChange(page: number): void {
  this.currentPage.set(page);
  this.loadItens();
}

onPageSizeChange(pageSize: number): void {
  this.pageSize.set(pageSize);
  this.currentPage.set(1); // Reset para primeira página
  this.loadItens();
}
```

## Repository Pattern

### 1. Criar Interface

```typescript
// shared/interfaces/paginated-result.interface.ts
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### 2. Implementar no Repository

```typescript
import { PaginatedResult } from '../../shared/interfaces/paginated-result.interface';
import { orderBy, QueryConstraint } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MeuRepository {
  
  async getPaginated(
    page: number = 1,
    pageSize: number = 10,
    searchTerm?: string
  ): Promise<PaginatedResult<MeuTipo>> {
    try {
      const constraints: QueryConstraint[] = [
        where('status', '==', 'ativo'),
        orderBy('nome'), // ou outro campo
      ];

      // Buscar todos para filtrar e contar
      const allItens = await this.firestoreService.getCollectionSnapshot<MeuTipo>(
        this.COLLECTION,
        ...constraints
      );

      // Filtrar por termo de busca se fornecido
      let filteredItens = allItens;
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        filteredItens = allItens.filter(item => 
          item.nome.toLowerCase().includes(term) ||
          item.codigo?.includes(term)
          // ... outros campos
        );
      }

      const total = filteredItens.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = filteredItens.slice(startIndex, endIndex);

      return {
        items,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Erro ao buscar itens paginados:', error);
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
  }
}
```

### 3. FirestoreService

Certifique-se de que o método `getCollectionSnapshot` existe:

```typescript
async getCollectionSnapshot<T extends DocumentData>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
): Promise<T[]> {
  const collectionRef = collection(this.firestore, collectionName) as CollectionReference<T>;
  const q = query(collectionRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as T));
}
```

## Exemplo Completo

Ver implementação em:
- [pacientes-list.component.ts](../../features/pacientes/pages/pacientes-list.component.ts)
- [paciente.repository.ts](../../../data/repositories/paciente.repository.ts)

## Interface PaginationConfig

```typescript
export interface PaginationConfig {
  currentPage: number;  // Página atual (1-indexed)
  pageSize: number;     // Itens por página
  totalItems: number;   // Total de itens
}
```

## Eventos

### pageChange
Emitido quando o usuário muda de página.
- **Tipo:** `number`
- **Valor:** Número da nova página

### pageSizeChange
Emitido quando o usuário muda o tamanho da página.
- **Tipo:** `number`
- **Valor:** Novo tamanho de página

## Visual

```
┌─────────────────────────────────────────────────────────────────┐
│ Mostrando 1 a 10 de 156 resultados                             │
│                                                                 │
│  [<<] [<] [1] [2] [3] ... [15] [16] [>] [>>]  [10 por página ▼]│
└─────────────────────────────────────────────────────────────────┘
```

## Customização

O componente usa Tailwind CSS. Para customizar cores:

```typescript
// No template do componente
[class.bg-primary]="page === config().currentPage"
[class.text-white]="page === config().currentPage"
```

Altere as classes conforme sua paleta de cores.

## Boas Práticas

1. **Reset de página ao buscar:** Sempre volte para página 1 ao fazer uma busca
2. **Loading state:** Mostre indicador de carregamento durante requisições
3. **Error handling:** Sempre trate erros de forma apropriada
4. **Debounce na busca:** Considere adicionar debounce no input de busca
5. **Persistência:** Considere salvar estado de paginação no localStorage

## Melhorias Futuras

- [ ] Adicionar debounce automático na busca
- [ ] Suporte a ordenação por colunas
- [ ] Persistência de estado no localStorage
- [ ] Paginação server-side com cursor (Firestore)
- [ ] Suporte a filtros avançados
- [ ] Exportação de dados filtrados
