# 🔐 Carrinho por Usuário - Implementação Completa

## ✅ O que foi implementado:

### 1. **Banco de Dados Atualizado** 🗄️
- ✅ Carrinho agora vinculado diretamente ao modelo `Usuario`
- ✅ Cada usuário tem **apenas um carrinho** (relacionamento 1:1)
- ✅ Campo `clienteId` (String) substituído por `usuarioId` (Integer)
- ✅ Relação com cascade delete (deletar usuário deleta carrinho)
- ✅ Migration criada e aplicada com sucesso

**Schema atualizado:**
```prisma
model Usuario {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  nome      String
  tipo      String    @default("cliente")
  carrinho  Carrinho?  // ← Relação 1:1
  pedidos   Pedido[]
}

model Carrinho {
  id         Int      @id @default(autoincrement())
  usuarioId  Int      @unique  // ← Chave única
  usuario    Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  itens      ItemCarrinho[]
  total      Float    @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

### 2. **Autenticação Obrigatória** 🔒

**Todas as rotas do carrinho agora requerem autenticação JWT:**
- ✅ Middleware `verificarToken` aplicado globalmente
- ✅ Usuario extraído do token automaticamente
- ✅ Cada usuário acessa apenas seu próprio carrinho
- ✅ Segurança aprimorada - não é possível acessar carrinho de outros usuários

---

### 3. **Rotas Simplificadas** 🚀

**Antes (sem autenticação):**
```
GET    /api/carrinho/:clienteId
POST   /api/carrinho/:clienteId/adicionar
PUT    /api/carrinho/:clienteId/itens/:itemId
DELETE /api/carrinho/:clienteId/itens/:itemId
DELETE /api/carrinho/:clienteId/limpar
```

**Depois (com autenticação):**
```
GET    /api/carrinho
POST   /api/carrinho/adicionar
PUT    /api/carrinho/itens/:itemId
DELETE /api/carrinho/itens/:itemId
DELETE /api/carrinho/limpar
```

**Benefícios:**
- ✅ URLs mais limpas e intuitivas
- ✅ Não precisa passar clienteId manualmente
- ✅ Impossível acessar carrinho de outro usuário
- ✅ Usuário identificado automaticamente pelo token

---

### 4. **Melhorias nos Controllers** ⚡

#### **Validação de Estoque**
```javascript
// Verifica se há estoque suficiente antes de adicionar
if (produto.quantidade < quantidade) {
  return res.status(400).json({
    message: `Estoque insuficiente. Disponível: ${produto.quantidade}`
  });
}
```

#### **Preço Promocional Automático**
```javascript
// Usa preço promocional automaticamente se produto estiver em promoção
const precoFinal = produto.emPromocao && produto.precoPromocional 
  ? produto.precoPromocional 
  : produto.preco;
```

#### **Informações do Usuário no Carrinho**
```javascript
// Carrinho retorna info do usuário
{
  "id": 1,
  "usuarioId": 5,
  "usuario": {
    "id": 5,
    "nome": "João Silva",
    "email": "joao@email.com"
  },
  "total": 299.80,
  "itens": [...]
}
```

#### **Segurança Aprimorada**
```javascript
// Verifica se item pertence ao usuário autenticado
if (item.carrinhoId !== carrinho.id) {
  return res.status(403).json({
    message: 'Este item não pertence ao seu carrinho'
  });
}
```

---

## 🎯 Como Usar

### 1. **Fazer Login**

Primeiro, obtenha um token de autenticação:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "cliente@email.com",
  "senha": "senha123"
}

# Resposta:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 5,
    "email": "cliente@email.com",
    "nome": "João Silva",
    "tipo": "cliente"
  }
}
```

### 2. **Usar o Token nas Requisições**

Todas as requisições ao carrinho devem incluir o token no header:

```bash
Authorization: Bearer SEU_TOKEN_AQUI
```

### 3. **Obter Carrinho**

```bash
GET /api/carrinho
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resposta:
{
  "success": true,
  "data": {
    "id": 1,
    "usuarioId": 5,
    "usuario": {
      "id": 5,
      "nome": "João Silva",
      "email": "cliente@email.com"
    },
    "total": 0,
    "itens": [],
    "createdAt": "2026-01-14T18:00:00.000Z",
    "updatedAt": "2026-01-14T18:00:00.000Z"
  }
}
```

### 4. **Adicionar Produto**

```bash
POST /api/carrinho/adicionar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "produtoId": 5,
  "quantidade": 2
}

# Resposta:
{
  "success": true,
  "message": "Produto adicionado ao carrinho com sucesso",
  "data": {
    "id": 1,
    "usuarioId": 5,
    "total": 159.80,
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
          "emPromocao": false,
          "categoria": { "nome": "Roupas" }
        }
      }
    ]
  }
}
```

### 5. **Atualizar Quantidade**

```bash
PUT /api/carrinho/itens/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "quantidade": 5
}
```

### 6. **Remover Produto**

```bash
DELETE /api/carrinho/itens/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 7. **Limpar Carrinho**

```bash
DELETE /api/carrinho/limpar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Comparação: Antes vs Depois

### **Antes (Sistema Antigo)**

❌ **Problemas:**
- Carrinho não vinculado ao usuário
- Qualquer pessoa com clienteId podia acessar qualquer carrinho
- Sem autenticação
- ClienteId podia ser qualquer string
- Não havia validação de propriedade
- Sem validação de estoque
- Preço promocional não aplicado automaticamente

**Exemplo de uso:**
```bash
# Qualquer um podia acessar com qualquer clienteId
GET /api/carrinho/cliente@email.com
GET /api/carrinho/outro@email.com  # ⚠️ Inseguro!
```

### **Depois (Sistema Novo)**

✅ **Melhorias:**
- Carrinho vinculado ao usuário autenticado
- Cada usuário acessa apenas seu próprio carrinho
- Autenticação JWT obrigatória
- Validação de estoque em tempo real
- Preço promocional aplicado automaticamente
- Relacionamento 1:1 no banco (um carrinho por usuário)
- URLs mais limpas e intuitivas
- Segurança aprimorada
- Informações do usuário incluídas na resposta

**Exemplo de uso:**
```bash
# Apenas o usuário autenticado acessa seu carrinho
GET /api/carrinho
Authorization: Bearer TOKEN_DO_USUARIO
```

---

## 🔐 Segurança Implementada

### 1. **Autenticação JWT**
- Token verificado em todas as requisições
- Token contém: `id`, `email`, `nome`, `tipo` do usuário
- Token expira após tempo configurado

### 2. **Isolamento por Usuário**
- Cada usuário acessa apenas seu próprio carrinho
- Impossível acessar/modificar carrinho de outros usuários
- Validação automática pelo middleware

### 3. **Validação de Propriedade**
```javascript
// Verifica se item pertence ao carrinho do usuário
if (item.carrinhoId !== carrinho.id) {
  return res.status(403).json({
    message: 'Este item não pertence ao seu carrinho'
  });
}
```

### 4. **Validação de Estoque**
```javascript
// Verifica disponibilidade antes de adicionar/atualizar
if (produto.quantidade < quantidade) {
  return res.status(400).json({
    message: `Estoque insuficiente. Disponível: ${produto.quantidade}`
  });
}
```

---

## 🎨 Integração Frontend

### **React Example com Autenticação**

```jsx
import { useState, useEffect } from 'react';

function Carrinho() {
  const [carrinho, setCarrinho] = useState(null);
  const token = localStorage.getItem('token'); // Token do login

  // Headers com autenticação
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    carregarCarrinho();
  }, []);

  const carregarCarrinho = async () => {
    const res = await fetch('/api/carrinho', { headers });
    const { data } = await res.json();
    setCarrinho(data);
  };

  const adicionarProduto = async (produtoId, quantidade) => {
    const res = await fetch('/api/carrinho/adicionar', {
      method: 'POST',
      headers,
      body: JSON.stringify({ produtoId, quantidade })
    });
    
    if (res.ok) {
      await carregarCarrinho();
    } else {
      const error = await res.json();
      alert(error.message); // Ex: "Estoque insuficiente"
    }
  };

  const removerItem = async (itemId) => {
    await fetch(`/api/carrinho/itens/${itemId}`, {
      method: 'DELETE',
      headers
    });
    await carregarCarrinho();
  };

  const atualizarQuantidade = async (itemId, quantidade) => {
    await fetch(`/api/carrinho/itens/${itemId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ quantidade })
    });
    await carregarCarrinho();
  };

  if (!carrinho) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Carrinho de {carrinho.usuario.nome}</h2>
      <p>Total: R$ {carrinho.total.toFixed(2)}</p>
      
      {carrinho.itens.map(item => (
        <div key={item.id}>
          <h3>{item.produto.nome}</h3>
          <p>Preço: R$ {item.precoUnitario.toFixed(2)}</p>
          {item.produto.emPromocao && (
            <span className="promo">🏷️ PROMOÇÃO</span>
          )}
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

## 📋 Endpoints Atualizados

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/carrinho` | ✅ Sim | Obter carrinho do usuário |
| POST | `/api/carrinho/adicionar` | ✅ Sim | Adicionar produto |
| PUT | `/api/carrinho/itens/:itemId` | ✅ Sim | Atualizar quantidade |
| DELETE | `/api/carrinho/itens/:itemId` | ✅ Sim | Remover produto |
| DELETE | `/api/carrinho/limpar` | ✅ Sim | Limpar carrinho |

**Todos os endpoints requerem:**
```
Authorization: Bearer {token}
```

---

## 🧪 Testando

### **1. Criar Usuário**
```bash
POST /api/auth/registro
{
  "email": "teste@email.com",
  "senha": "senha123",
  "nome": "Usuário Teste",
  "tipo": "cliente"
}
```

### **2. Fazer Login**
```bash
POST /api/auth/login
{
  "email": "teste@email.com",
  "senha": "senha123"
}

# Salvar o token retornado
```

### **3. Testar Carrinho**
```bash
# Obter carrinho (cria automaticamente se não existir)
GET /api/carrinho
Authorization: Bearer {seu_token}

# Adicionar produto
POST /api/carrinho/adicionar
Authorization: Bearer {seu_token}
{
  "produtoId": 1,
  "quantidade": 2
}
```

---

## ✨ Recursos Novos

### **1. Validação de Estoque**
- ✅ Verifica disponibilidade ao adicionar
- ✅ Verifica ao atualizar quantidade
- ✅ Mensagem clara: "Estoque insuficiente. Disponível: X"

### **2. Preço Promocional Automático**
- ✅ Detecta automaticamente se produto está em promoção
- ✅ Aplica `precoPromocional` em vez de `preco`
- ✅ Atualiza ao modificar quantidade

### **3. Informações Completas**
- ✅ Dados do usuário no carrinho
- ✅ Categoria do produto
- ✅ Status de promoção
- ✅ Timestamps de criação/atualização

### **4. Segurança de Propriedade**
- ✅ Valida se item pertence ao usuário
- ✅ Erro 403 se tentar acessar item de outro usuário
- ✅ Impossível manipular carrinho alheio

---

## 🚀 Próximos Passos (Sugestões)

1. **Carrinho Compartilhado**: Permitir compartilhar carrinho temporariamente
2. **Histórico de Carrinhos**: Salvar carrinhos abandonados
3. **Limites de Quantidade**: Configurar quantidade máxima por produto
4. **Carrinho Salvo**: Permitir múltiplos carrinhos salvos (lista de desejos)
5. **Notificações**: Avisar quando produto do carrinho entrar em promoção
6. **Sincronização**: Sincronizar carrinho entre dispositivos do mesmo usuário

---

## 📝 Migração de Dados

A migration criada migra automaticamente os carrinhos existentes:

1. ✅ Tenta vincular carrinhos ao usuário pelo email (`clienteId` = `email`)
2. ✅ Deleta carrinhos órfãos (sem usuário correspondente)
3. ✅ Remove campo `clienteId` antigo
4. ✅ Adiciona campo `usuarioId` novo
5. ✅ Cria relacionamento com `Usuario`

**SQL executado:**
```sql
-- Vincular carrinhos existentes
UPDATE "Carrinho" 
SET "usuarioId" = "Usuario"."id" 
FROM "Usuario" 
WHERE "Carrinho"."clienteId" = "Usuario"."email";

-- Deletar carrinhos sem usuário
DELETE FROM "Carrinho" WHERE "usuarioId" IS NULL;

-- Remover campo antigo
ALTER TABLE "Carrinho" DROP COLUMN "clienteId";
```

---

## ✅ Conclusão

O sistema de carrinho foi completamente refatorado para:

✅ **Segurança**: Autenticação JWT obrigatória  
✅ **Isolamento**: Cada usuário tem seu próprio carrinho  
✅ **Integridade**: Relação 1:1 no banco de dados  
✅ **Validações**: Estoque e propriedade verificados  
✅ **Promoções**: Preço promocional aplicado automaticamente  
✅ **Usabilidade**: URLs simplificadas e intuitivas  
✅ **Documentação**: Swagger atualizado com novos endpoints  

**Acesse:** http://localhost:3000/api-docs
