# Novos Recursos - Produtos

## 📋 Resumo das Funcionalidades

Este documento descreve os novos recursos implementados para produtos:

1. **Produtos Mais Vendidos** - Retorna produtos ordenados por quantidade vendida
2. **Produtos Novidades** - Retorna produtos recém cadastrados
3. **Sistema de Promoções** - Permite vendedores definirem promoções para produtos

---

## 🆕 Alterações no Banco de Dados

### Novos Campos no Modelo `Produto`:

- `emPromocao` (Boolean) - Indica se o produto está em promoção
- `precoPromocional` (Float?) - Preço do produto durante a promoção (opcional)
- `createdAt` (DateTime) - Data de criação do produto
- `updatedAt` (DateTime) - Data da última atualização

---

## 🚀 Novos Endpoints

### 1. Produtos Mais Vendidos

**GET** `/api/produtos/mais-vendidos/lista`

Retorna os produtos ordenados por quantidade vendida (do maior para o menor).

**Parâmetros de Query:**
- `limit` (opcional) - Número máximo de produtos a retornar (padrão: 10)

**Exemplo de Requisição:**
```bash
GET /api/produtos/mais-vendidos/lista?limit=5
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Camiseta Premium",
      "preco": 89.90,
      "quantidadeVendida": 150,
      "categoria": {
        "id": 1,
        "nome": "Roupas"
      },
      ...
    }
  ]
}
```

---

### 2. Produtos Novidades

**GET** `/api/produtos/novidades/lista`

Retorna produtos recém cadastrados (ordenados do mais recente para o mais antigo).

**Parâmetros de Query:**
- `limit` (opcional) - Número máximo de produtos a retornar (padrão: 10)
- `dias` (opcional) - Considera produtos criados nos últimos X dias (padrão: 30)

**Exemplo de Requisição:**
```bash
GET /api/produtos/novidades/lista?limit=10&dias=15
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "total": 5,
  "filtros": {
    "dias": 15,
    "dataLimite": "2026-01-01T00:00:00.000Z"
  },
  "data": [
    {
      "id": 25,
      "nome": "Produto Novo",
      "preco": 129.90,
      "createdAt": "2026-01-14T10:30:00.000Z",
      "categoria": {
        "id": 2,
        "nome": "Eletrônicos"
      },
      ...
    }
  ]
}
```

---

### 3. Produtos em Promoção

**GET** `/api/produtos/promocoes/lista`

Retorna todos os produtos que estão em promoção.

**Parâmetros de Query:**
- `limit` (opcional) - Número máximo de produtos a retornar (padrão: 10)

**Exemplo de Requisição:**
```bash
GET /api/produtos/promocoes/lista?limit=20
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": 10,
      "nome": "Notebook Gamer",
      "preco": 4999.00,
      "emPromocao": true,
      "precoPromocional": 3999.00,
      "categoria": {
        "id": 2,
        "nome": "Eletrônicos"
      },
      ...
    }
  ]
}
```

---

### 4. Definir/Remover Promoção

**PUT** `/api/produtos/{id}/promocao`

Permite que **vendedores e administradores** definam, editem ou removam uma promoção de um produto.

🔒 **Autenticação:** Requer token JWT (**vendedor** ou **admin**)

**Parâmetros de Rota:**
- `id` (obrigatório) - ID do produto

**Body da Requisição:**
```json
{
  "emPromocao": true,
  "precoPromocional": 59.90
}
```

**Campos:**
- `emPromocao` (boolean, obrigatório) - Define se o produto está em promoção
- `precoPromocional` (number, condicional) - Preço promocional (obrigatório quando `emPromocao` é `true`)

**Validações:**
- O preço promocional deve ser menor que o preço normal
- O preço promocional deve ser maior que zero
- Se `emPromocao` for `true`, `precoPromocional` é obrigatório

**Exemplo - Ativar/Editar Promoção:**
```bash
curl -X PUT http://localhost:3000/api/produtos/10/promocao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "emPromocao": true,
    "precoPromocional": 79.90
  }'
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Promoção definida com sucesso! Preço: R$ 99.90 → R$ 79.90",
  "data": {
    "id": 10,
    "nome": "Produto Exemplo",
    "preco": 99.90,
    "emPromocao": true,
    "precoPromocional": 79.90,
    ...
  }
}
```

**Exemplo - Remover Promoção (deletar promoção):**
```bash
curl -X PUT http://localhost:3000/api/produtos/10/promocao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "emPromocao": false
  }'
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Promoção removida com sucesso",
  "data": {
    "id": 10,
    "nome": "Produto Exemplo",
    "preco": 99.90,
    "emPromocao": false,
    "precoPromocional": null,
    ...
  }
}
```

**Possíveis Erros:**
- `400` - Campo obrigatório faltando ou validação falhou
- `401` - Token de autenticação inválido ou ausente
- `403` - Usuário não é vendedor
- `404` - Produto não encontrado

---

## 📝 Atualização nos Endpoints Existentes

### Criar Produto (POST /api/produtos)

Agora aceita os novos campos opcionais:

```json
{
  "nome": "Produto Novo",
  "preco": 99.90,
  "descricao": "Descrição do produto",
  "imagem": "https://exemplo.com/imagem.jpg",
  "quantidade": 100,
  "categoriaId": 1,
  "emPromocao": true,           // ← NOVO
  "precoPromocional": 79.90     // ← NOVO
}
```

### Atualizar Produto (PUT /api/produtos/:id)

Agora aceita os novos campos para atualização:

```json
{
  "emPromocao": true,           // ← NOVO
  "precoPromocional": 79.90     // ← NOVO
}
```

---

## 💡 Casos de Uso

### Caso 1: Listar Produtos em Destaque na Home
```javascript
// Buscar os 6 produtos mais vendidos
fetch('/api/produtos/mais-vendidos/lista?limit=6')
```

### Caso 2: Seção "Novidades" na Loja
```javascript
// Buscar produtos criados nos últimos 7 dias
fetch('/api/produtos/novidades/lista?dias=7&limit=8')
```

### Caso 3: Banner de Promoções
```javascript
// Buscar todos os produtos em promoção
fetch('/api/produtos/promocoes/lista?limit=12')
```

### Caso 4: Vendedor Criando Promoção Flash
```javascript
// Ativar promoção de 30% em um produto
const produto = await fetch('/api/produtos/10').then(r => r.json());
const precoPromocional = produto.data.preco * 0.7; // 30% de desconto

await fetch('/api/produtos/10/promocao', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TOKEN'
  },
  body: JSON.stringify({
    emPromocao: true,
    precoPromocional: precoPromocional
  })
});
```

---

## 🎯 Endpoints Resumidos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/produtos/mais-vendidos/lista` | Produtos mais vendidos | Não |
| GET | `/api/produtos/novidades/lista` | Produtos novidades | Não |
| GET | `/api/produtos/promocoes/lista` | Produtos em promoção | Não |
| PUT | `/api/produtos/:id/promocao` | Definir/remover promoção | Sim (Vendedor) |

---

## 🔍 Observações Importantes

1. **Quantidade Vendida**: O campo `quantidadeVendida` é atualizado automaticamente quando um pedido é criado
2. **Data de Criação**: O campo `createdAt` é preenchido automaticamente ao criar um produto
3. **Preço Promocional**: Sempre valida se o preço promocional é menor que o preço normal
4. **Permissões**: Apenas vendedores autenticados podem definir promoções

---

## 📊 Estrutura do Produto Atualizada

```typescript
{
  id: number,
  nome: string,
  preco: number,
  descricao: string,
  imagem: string,
  quantidade: number,
  quantidadeVendida: number,
  isBestseller: boolean,
  emPromocao: boolean,           // ← NOVO
  precoPromocional: number?,     // ← NOVO
  cor: string?,
  tamanho: string?,
  categoriaId: number,
  categoria: Categoria,
  createdAt: DateTime,           // ← NOVO
  updatedAt: DateTime            // ← NOVO
}
```

---

## 🧪 Testando as Funcionalidades

Você pode testar os novos endpoints usando o Swagger UI em:
```
http://localhost:3000/api-docs
```

Ou usar os scripts de teste incluídos no projeto.
