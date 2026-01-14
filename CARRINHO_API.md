# 🛒 API do Carrinho de Compras

## 📋 Resumo

Esta API gerencia o carrinho de compras dos clientes, permitindo adicionar, atualizar, remover produtos e limpar o carrinho.

---

## 🔑 Conceitos Importantes

### ClienteId
- O `clienteId` é um identificador único do cliente (pode ser email, UUID, session ID, etc)
- É usado para associar o carrinho ao cliente
- Cada cliente tem apenas **um carrinho ativo**

### ItemCarrinho
- Representa um produto no carrinho
- Contém: produto, quantidade, preço unitário e subtotal
- Cada item tem um `itemId` único

### Cálculo Automático
- O subtotal de cada item é calculado automaticamente: `quantidade × preço unitário`
- O total do carrinho é a soma de todos os subtotais
- Os valores são recalculados a cada operação

---

## 🚀 Endpoints

### 1. Obter Carrinho

**GET** `/api/carrinho/{clienteId}`

Obtém o carrinho do cliente. Se não existir, cria automaticamente um carrinho vazio.

**Parâmetros de Rota:**
- `clienteId` (string, obrigatório) - ID único do cliente

**Exemplo de Requisição:**
```bash
GET /api/carrinho/cliente@email.com
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "clienteId": "cliente@email.com",
    "total": 259.80,
    "itens": [
      {
        "id": 1,
        "produtoId": 5,
        "quantidade": 2,
        "precoUnitario": 79.90,
        "subtotal": 159.80,
        "produto": {
          "id": 5,
          "nome": "Camiseta Premium",
          "preco": 79.90,
          "imagem": "https://...",
          "categoria": {
            "id": 1,
            "nome": "Roupas"
          }
        }
      },
      {
        "id": 2,
        "produtoId": 8,
        "quantidade": 1,
        "precoUnitario": 100.00,
        "subtotal": 100.00,
        "produto": {
          "id": 8,
          "nome": "Calça Jeans",
          "preco": 100.00,
          "imagem": "https://..."
        }
      }
    ],
    "createdAt": "2026-01-14T10:00:00.000Z",
    "updatedAt": "2026-01-14T15:30:00.000Z"
  }
}
```

---

### 2. Adicionar Produto ao Carrinho

**POST** `/api/carrinho/{clienteId}/adicionar`

Adiciona um produto ao carrinho. Se o produto já existir, incrementa a quantidade.

**Parâmetros de Rota:**
- `clienteId` (string, obrigatório) - ID único do cliente

**Body da Requisição:**
```json
{
  "produtoId": 5,
  "quantidade": 2
}
```

**Campos:**
- `produtoId` (integer, obrigatório) - ID do produto
- `quantidade` (integer, obrigatório) - Quantidade a adicionar (deve ser > 0)

**Exemplo de Requisição:**
```bash
POST /api/carrinho/cliente@email.com/adicionar
Content-Type: application/json

{
  "produtoId": 5,
  "quantidade": 2
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Produto adicionado ao carrinho com sucesso",
  "data": {
    "id": 1,
    "clienteId": "cliente@email.com",
    "total": 159.80,
    "itens": [
      {
        "id": 1,
        "produtoId": 5,
        "quantidade": 2,
        "precoUnitario": 79.90,
        "subtotal": 159.80,
        "produto": { ... }
      }
    ]
  }
}
```

**Possíveis Erros:**
- `400` - clienteId, produtoId ou quantidade faltando/inválido
- `404` - Produto não encontrado
- `500` - Erro interno ao adicionar produto

---

### 3. Atualizar Quantidade de Item

**PUT** `/api/carrinho/{clienteId}/itens/{itemId}`

Atualiza a quantidade de um item específico no carrinho.

**Parâmetros de Rota:**
- `clienteId` (string, obrigatório) - ID único do cliente
- `itemId` (integer, obrigatório) - ID do item no carrinho

**Body da Requisição:**
```json
{
  "quantidade": 5
}
```

**Campos:**
- `quantidade` (integer, obrigatório) - Nova quantidade (deve ser > 0)

**Exemplo de Requisição:**
```bash
PUT /api/carrinho/cliente@email.com/itens/1
Content-Type: application/json

{
  "quantidade": 5
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Quantidade atualizada com sucesso",
  "data": {
    "id": 1,
    "clienteId": "cliente@email.com",
    "total": 399.50,
    "itens": [
      {
        "id": 1,
        "produtoId": 5,
        "quantidade": 5,
        "precoUnitario": 79.90,
        "subtotal": 399.50,
        "produto": { ... }
      }
    ]
  }
}
```

**Possíveis Erros:**
- `400` - Dados inválidos ou item não pertence ao carrinho
- `404` - Carrinho ou item não encontrado
- `500` - Erro interno ao atualizar

---

### 4. Remover Produto do Carrinho

**DELETE** `/api/carrinho/{clienteId}/itens/{itemId}`

Remove completamente um item do carrinho.

**Parâmetros de Rota:**
- `clienteId` (string, obrigatório) - ID único do cliente
- `itemId` (integer, obrigatório) - ID do item a ser removido

**Exemplo de Requisição:**
```bash
DELETE /api/carrinho/cliente@email.com/itens/1
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Produto removido do carrinho com sucesso",
  "data": {
    "id": 1,
    "clienteId": "cliente@email.com",
    "total": 100.00,
    "itens": [
      {
        "id": 2,
        "produtoId": 8,
        "quantidade": 1,
        "precoUnitario": 100.00,
        "subtotal": 100.00,
        "produto": { ... }
      }
    ]
  }
}
```

**Possíveis Erros:**
- `400` - clienteId não fornecido ou item não pertence ao carrinho
- `404` - Carrinho ou item não encontrado
- `500` - Erro interno ao remover

---

### 5. Limpar Carrinho

**DELETE** `/api/carrinho/{clienteId}/limpar`

Remove todos os itens do carrinho, zerrando o total.

**Parâmetros de Rota:**
- `clienteId` (string, obrigatório) - ID único do cliente

**Exemplo de Requisição:**
```bash
DELETE /api/carrinho/cliente@email.com/limpar
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Carrinho limpo com sucesso",
  "data": {
    "id": 1,
    "clienteId": "cliente@email.com",
    "total": 0,
    "itens": [],
    "createdAt": "2026-01-14T10:00:00.000Z",
    "updatedAt": "2026-01-14T16:00:00.000Z"
  }
}
```

**Possíveis Erros:**
- `400` - clienteId não fornecido
- `404` - Carrinho não encontrado
- `500` - Erro interno ao limpar

---

## 🎯 Endpoints Resumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/carrinho/:clienteId` | Obter carrinho |
| POST | `/api/carrinho/:clienteId/adicionar` | Adicionar produto |
| PUT | `/api/carrinho/:clienteId/itens/:itemId` | Atualizar quantidade |
| DELETE | `/api/carrinho/:clienteId/itens/:itemId` | Remover produto |
| DELETE | `/api/carrinho/:clienteId/limpar` | Limpar carrinho |

---

## 💡 Casos de Uso

### Caso 1: Cliente Adicionando Produtos ao Carrinho

```javascript
// 1. Adicionar primeiro produto
await fetch('/api/carrinho/cliente@email.com/adicionar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    produtoId: 5,
    quantidade: 2
  })
});

// 2. Adicionar outro produto
await fetch('/api/carrinho/cliente@email.com/adicionar', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    produtoId: 8,
    quantidade: 1
  })
});

// 3. Ver carrinho atualizado
const response = await fetch('/api/carrinho/cliente@email.com');
const { data: carrinho } = await response.json();
console.log('Total:', carrinho.total);
```

### Caso 2: Atualizar Quantidade no Carrinho

```javascript
// Buscar carrinho e encontrar itemId
const response = await fetch('/api/carrinho/cliente@email.com');
const { data: carrinho } = await response.json();

const item = carrinho.itens.find(i => i.produtoId === 5);

// Atualizar quantidade
await fetch(`/api/carrinho/cliente@email.com/itens/${item.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantidade: 5
  })
});
```

### Caso 3: Remover Item do Carrinho

```javascript
// Obter carrinho
const response = await fetch('/api/carrinho/cliente@email.com');
const { data: carrinho } = await response.json();

// Remover primeiro item
const itemId = carrinho.itens[0].id;
await fetch(`/api/carrinho/cliente@email.com/itens/${itemId}`, {
  method: 'DELETE'
});
```

### Caso 4: Finalizar Compra (Limpar Carrinho)

```javascript
// Após criar o pedido, limpar o carrinho
await fetch('/api/carrinho/cliente@email.com/limpar', {
  method: 'DELETE'
});
```

### Caso 5: Carrinho Persistente entre Sessões

```javascript
// Frontend - armazenar clienteId
const clienteId = localStorage.getItem('clienteId') || generateUUID();
localStorage.setItem('clienteId', clienteId);

// Buscar carrinho ao carregar página
const response = await fetch(`/api/carrinho/${clienteId}`);
const { data: carrinho } = await response.json();

// O carrinho persiste mesmo se o cliente fechar o navegador
```

---

## 📊 Estrutura de Dados

### Carrinho
```typescript
{
  id: number,
  clienteId: string,
  total: number,
  itens: ItemCarrinho[],
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### ItemCarrinho
```typescript
{
  id: number,
  carrinhoId: number,
  produtoId: number,
  quantidade: number,
  precoUnitario: number,
  subtotal: number,
  produto: Produto,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## ✅ Validações Implementadas

1. **clienteId**: Obrigatório em todas as operações
2. **produtoId**: Deve existir no banco de dados
3. **quantidade**: Deve ser número inteiro positivo (> 0)
4. **itemId**: Deve existir e pertencer ao carrinho do cliente
5. **Cálculos**: Subtotal e total recalculados automaticamente

---

## 🔍 Comportamentos Especiais

### Produto Duplicado
Se você adicionar um produto que já está no carrinho:
- A quantidade é **incrementada** (não substituída)
- O subtotal é recalculado automaticamente

Exemplo:
```javascript
// Carrinho tem: Produto 5, quantidade 2

// Adicionar mais 3 unidades do Produto 5
POST /api/carrinho/cliente@email.com/adicionar
{
  "produtoId": 5,
  "quantidade": 3
}

// Resultado: Produto 5, quantidade 5 (2 + 3)
```

### Carrinho Vazio
- Limpar carrinho **não deleta** o carrinho, apenas remove os itens
- Total fica zerado
- Carrinho permanece associado ao clienteId

### Criação Automática
- Ao buscar carrinho que não existe, ele é criado automaticamente
- Ao adicionar produto para clienteId novo, carrinho é criado primeiro

---

## 🧪 Testando no Swagger

Acesse a documentação interativa:
```
http://localhost:3000/api-docs
```

Todos os endpoints do carrinho estão documentados na seção **Carrinho**.

---

## 💻 Exemplos com cURL

### Obter Carrinho
```bash
curl -X GET http://localhost:3000/api/carrinho/cliente@email.com
```

### Adicionar Produto
```bash
curl -X POST http://localhost:3000/api/carrinho/cliente@email.com/adicionar \
  -H "Content-Type: application/json" \
  -d '{
    "produtoId": 5,
    "quantidade": 2
  }'
```

### Atualizar Quantidade
```bash
curl -X PUT http://localhost:3000/api/carrinho/cliente@email.com/itens/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantidade": 5
  }'
```

### Remover Produto
```bash
curl -X DELETE http://localhost:3000/api/carrinho/cliente@email.com/itens/1
```

### Limpar Carrinho
```bash
curl -X DELETE http://localhost:3000/api/carrinho/cliente@email.com/limpar
```

---

## 🎨 Integração Frontend

### React Example

```jsx
import { useState, useEffect } from 'react';

function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const clienteId = localStorage.getItem('clienteId');

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const carregarCarrinho = async () => {
    const res = await fetch(`/api/carrinho/${clienteId}`);
    const { data } = await res.json();
    setCarrinho(data);
  };

  const adicionarProduto = async (produtoId, quantidade) => {
    await fetch(`/api/carrinho/${clienteId}/adicionar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produtoId, quantidade })
    });
    await carregarCarrinho();
  };

  const removerItem = async (itemId) => {
    await fetch(`/api/carrinho/${clienteId}/itens/${itemId}`, {
      method: 'DELETE'
    });
    await carregarCarrinho();
  };

  const atualizarQuantidade = async (itemId, quantidade) => {
    await fetch(`/api/carrinho/${clienteId}/itens/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade })
    });
    await carregarCarrinho();
  };

  return (
    <div>
      <h2>Meu Carrinho</h2>
      <p>Total: R$ {carrinho?.total.toFixed(2)}</p>
      
      {carrinho?.itens.map(item => (
        <div key={item.id}>
          <h3>{item.produto.nome}</h3>
          <p>Preço: R$ {item.precoUnitario.toFixed(2)}</p>
          <input 
            type="number" 
            value={item.quantidade}
            onChange={(e) => atualizarQuantidade(item.id, e.target.value)}
          />
          <p>Subtotal: R$ {item.subtotal.toFixed(2)}</p>
          <button onClick={() => removerItem(item.id)}>Remover</button>
        </div>
      ))}
    </div>
  );
}
```

---

## 📝 Observações

1. **Persistência**: O carrinho persiste no banco de dados
2. **Session ID**: Use UUID ou email como clienteId
3. **Sem Autenticação**: A API de carrinho não requer autenticação (carrinho anônimo)
4. **Preço Fixo**: O preço unitário é fixado no momento da adição (não muda se o produto for atualizado)
5. **Checkout**: Após criar o pedido, limpe o carrinho usando o endpoint `/limpar`

---

## 🚀 Próximos Passos (Sugestões)

1. **Validação de Estoque**: Verificar se há quantidade suficiente antes de adicionar
2. **Carrinho Expirado**: Limpar carrinhos abandonados após X dias
3. **Cupons de Desconto**: Aplicar cupons no carrinho
4. **Frete**: Calcular frete baseado no CEP
5. **Carrinho Salvo**: Permitir salvar carrinhos para depois
