# Admin - Funcionalidades Implementadas

## Resumo
O administrador agora consegue executar todas as operações que um vendedor faz, além de cadastrar vendedores. As permissões foram expandidas para permitir que admin tenha acesso completo ao painel de gerenciamento.

---

## Funcionalidades do Admin

### 1. **Gerenciar Categorias**
O admin pode criar, editar e deletar categorias de produtos.

#### Endpoints:
- **POST** `/api/categorias` - Criar nova categoria
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Body**:
    ```json
    {
      "nome": "Eletrônicos"
    }
    ```

- **PUT** `/api/categorias/:id` - Atualizar categoria
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Body**:
    ```json
    {
      "nome": "Eletrônicos Atualizados"
    }
    ```

- **DELETE** `/api/categorias/:id` - Deletar categoria
  - **Autenticação**: Bearer token (admin ou vendedor)

---

### 2. **Gerenciar Produtos**
O admin pode criar, editar e deletar produtos, além de definir promoções.

#### Endpoints:
- **POST** `/api/produtos` - Criar novo produto
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Body**:
    ```json
    {
      "nome": "Notebook",
      "preco": 2500.00,
      "descricao": "Notebook de alta performance",
      "imagem": "url-da-imagem",
      "quantidade": 10,
      "categoriaId": 1,
      "cor": "Preto",
      "tamanho": "15 polegadas"
    }
    ```

- **PUT** `/api/produtos/:id` - Atualizar produto
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Body**: Mesmo formato acima (enviar apenas os campos a atualizar)

- **DELETE** `/api/produtos/:id` - Deletar produto
  - **Autenticação**: Bearer token (admin ou vendedor)

- **PUT** `/api/produtos/:id/promocao` - Definir promoção
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Body**:
    ```json
    {
      "emPromocao": true,
      "precoPromocional": 1999.00
    }
    ```

---

### 3. **Gerenciar Pedidos**
O admin pode visualizar, filtrar e atualizar o status de pedidos.

#### Endpoints:
- **GET** `/api/pedidos` - Listar todos os pedidos
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Resposta**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 1,
          "numeroPedido": "PED-001",
          "status": "pendente",
          "nomeCliente": "João Silva",
          "emailCliente": "joao@email.com",
          "telefonecliente": "11999999999",
          "total": 5000.00,
          "createdAt": "2026-01-14T10:30:00Z",
          "updatedAt": "2026-01-14T10:30:00Z"
        }
      ]
    }
    ```

- **GET** `/api/pedidos/status/:status` - Filtrar pedidos por status
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Status válidos**: `pendente`, `processando`, `enviado`, `entregue`, `cancelado`

- **PUT** `/api/pedidos/:id/status` - Atualizar status do pedido
  - **Autenticação**: Bearer token (admin ou vendedor)
  - **Body**:
    ```json
    {
      "status": "enviado"
    }
    ```

- **DELETE** `/api/pedidos/:id` - Cancelar pedido
  - **Autenticação**: Bearer token (admin ou vendedor)

---

## Mudanças de Backend

### Middleware Novo: `verificarVendedorOuAdmin`
Um novo middleware foi criado para permitir que tanto vendedores quanto administradores acessem as rotas protegidas.

**Arquivo**: `src/middlewares/authMiddleware.js`

```javascript
export const verificarVendedorOuAdmin = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'vendedor' && req.usuario.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas vendedores e administradores podem executar esta ação',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar tipo de usuário',
      error: error.message,
    });
  }
};
```

### Rotas Atualizadas
Todas as rotas que eram restritas apenas a vendedores agora usam o middleware `verificarVendedorOuAdmin`:

**Categorias** (`src/routes/categoriaRoutes.js`):
- POST `/api/categorias`
- PUT `/api/categorias/:id`
- DELETE `/api/categorias/:id`

**Produtos** (`src/routes/produtoRoutes.js`):
- POST `/api/produtos`
- PUT `/api/produtos/:id`
- PUT `/api/produtos/:id/promocao`
- DELETE `/api/produtos/:id`

**Pedidos** (`src/routes/pedidoRoutes.js`):
- GET `/api/pedidos`
- GET `/api/pedidos/status/:status`
- PUT `/api/pedidos/:id/status`
- DELETE `/api/pedidos/:id`

---

## Como Usar no Frontend

### 1. **Login do Admin**
```javascript
const loginAdmin = async () => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@email.com',
      senha: 'senha123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  // token contém: { id, email, tipo: 'admin', iat, exp }
};
```

### 2. **Fazer Requisições com Token**
```javascript
const token = localStorage.getItem('token');

// Exemplo: Criar uma categoria
const criarCategoria = async (nome) => {
  const response = await fetch('/api/categorias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ nome })
  });
  
  return await response.json();
};
```

### 3. **Verificar Tipo de Usuário**
```javascript
// Após login, salve o tipo de usuário
const user = jwt_decode(token); // use a biblioteca jwt-decode
const isAdmin = user.tipo === 'admin';
const isVendedor = user.tipo === 'vendedor';

// Use para mostrar/esconder menu de admin
if (isAdmin || isVendedor) {
  // Mostrar menu de gerenciamento
}
```

### 4. **Exemplo: Listar Pedidos**
```javascript
const listarPedidos = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/pedidos', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log(data.data); // Array de pedidos
};
```

### 5. **Exemplo: Atualizar Status do Pedido**
```javascript
const atualizarStatusPedido = async (pedidoId, novoStatus) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: novoStatus })
  });
  
  return await response.json();
};
```

---

## Checklist para Frontend

- [ ] Criar página de Dashboard do Admin
- [ ] Implementar menu de navegação com opções:
  - [ ] Gerenciar Categorias
  - [ ] Gerenciar Produtos
  - [ ] Gerenciar Pedidos
  - [ ] Gerenciar Vendedores (já existente)
- [ ] Criar formulário para criar/editar categorias
- [ ] Criar formulário para criar/editar produtos
- [ ] Criar tabela para listar/filtrar pedidos
- [ ] Implementar botões para atualizar status de pedidos
- [ ] Implementar proteção de rotas (apenas admin/vendedor)
- [ ] Adicionar tratamento de erros (403 Forbidden)
- [ ] Adicionar validação de formulários
- [ ] Implementar feedback visual (loading, sucesso, erro)

---

## Notas Importantes

1. **Token obrigatório**: Todas as rotas protegidas requerem um token JWT válido no header `Authorization: Bearer <token>`
2. **Erro 403**: Se receber erro 403, significa que o usuário não é admin nem vendedor
3. **Erro 401**: Se receber erro 401, significa que o token é inválido ou expirou
4. **CORS**: Certifique-se de que o frontend está na URL correta (sem issues de CORS)

---

**Data de Implementação**: 14 de janeiro de 2026
