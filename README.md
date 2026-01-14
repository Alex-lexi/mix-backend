# 🛍️ Mix Backend - E-Commerce API

API backend completa para um sistema de e-commerce com autenticação JWT, gestão de produtos, carrinho de compras e pedidos.

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Registro de usuários (Vendedor/Cliente)
- ✅ Login com JWT
- ✅ Perfil do usuário
- ✅ Autenticação baseada em tokens

### 📦 Produtos
- ✅ CRUD completo (apenas vendedores)
- ✅ Busca global
- ✅ Filtros avançados (preço, categoria, cor, tamanho)
- ✅ Produtos similares
- ✅ Bestsellers

### 🛒 Carrinho de Compras
- ✅ Adicionar/remover itens
- ✅ Atualizar quantidades
- ✅ Cálculo automático de total
- ✅ Carrinho por clienteId e/ou usuário autenticado

### 📋 Pedidos
- ✅ Criar pedidos a partir do carrinho
- ✅ Rastrear pedidos
- ✅ Atualizar status (vendedor)
- ✅ Histórico de pedidos

### 🏷️ Categorias
- ✅ CRUD de categorias (apenas vendedores)
- ✅ Listar produtos por categoria

## 🚀 Início Rápido

### Pré-requisitos
- Node.js v16+
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone https://github.com/Alex-lexi/mix-backend.git
cd mix-backend

# Instalar dependências
npm install

# Configurar banco de dados (Prisma)
npx prisma migrate dev

# Iniciar servidor
node index.js
```

O servidor iniciará em `http://localhost:3000`

## 📚 Documentação da API

### Swagger UI
Acesse a documentação interativa em: `http://localhost:3000/api-docs`

## 🔑 Autenticação

### Registro
```bash
POST /api/auth/register

Body:
{
  "email": "usuario@example.com",
  "senha": "senha123456",
  "nome": "João Silva",
  "tipo": "vendedor",
  "telefone": "11987654321"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "nome": "João Silva",
    "tipo": "vendedor",
    "telefone": "11987654321"
  }
}
```

### Login
```bash
POST /api/auth/login

Body:
{
  "email": "usuario@example.com",
  "senha": "senha123456"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": { ... }
}
```

### Usar o Token
```bash
GET /api/auth/perfil

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📝 Endpoints Principais

### 🔐 Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Registrar novo usuário | ❌ |
| POST | `/api/auth/login` | Fazer login | ❌ |
| GET | `/api/auth/perfil` | Obter perfil | ✅ |
| PUT | `/api/auth/perfil` | Atualizar perfil | ✅ |

### 📦 Produtos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/produtos` | Listar todos | ❌ |
| GET | `/api/produtos/:id` | Obter por ID | ❌ |
| GET | `/api/produtos/busca/search?nome=...` | Buscar por nome | ❌ |
| GET | `/api/produtos/buscar/global/search?q=...` | Busca global | ❌ |
| GET | `/api/produtos/filtrar/avancado/search` | Filtros avançados | ❌ |
| GET | `/api/produtos/categoria/:id` | Por categoria | ❌ |
| GET | `/api/produtos/similares/:id` | Produtos similares | ❌ |
| GET | `/api/produtos/bestsellers/lista` | Mais vendidos | ❌ |
| POST | `/api/produtos` | Criar | ✅ Vendedor |
| PUT | `/api/produtos/:id` | Atualizar | ✅ Vendedor |
| DELETE | `/api/produtos/:id` | Deletar | ✅ Vendedor |

### 🛒 Carrinho
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/carrinho/:clienteId` | Obter carrinho | ❌ |
| POST | `/api/carrinho/:clienteId/adicionar` | Adicionar item | ❌ |
| PUT | `/api/carrinho/:clienteId/atualizar/:itemId` | Atualizar item | ❌ |
| DELETE | `/api/carrinho/:clienteId/remover/:itemId` | Remover item | ❌ |
| DELETE | `/api/carrinho/:clienteId/limpar` | Limpar carrinho | ❌ |

### 📋 Pedidos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/pedidos` | Listar (vendedor) | ✅ Vendedor |
| GET | `/api/pedidos/:id` | Obter por ID | ❌ |
| GET | `/api/pedidos/numero/:numero` | Por número | ❌ |
| GET | `/api/pedidos/status/:status` | Por status | ✅ Vendedor |
| POST | `/api/pedidos` | Criar a partir do carrinho | ❌ |
| PUT | `/api/pedidos/:id/status` | Atualizar status | ✅ Vendedor |
| DELETE | `/api/pedidos/:id` | Cancelar | ✅ Vendedor |

### 🏷️ Categorias
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/categorias` | Listar | ❌ |
| GET | `/api/categorias/:id` | Obter por ID | ❌ |
| POST | `/api/categorias` | Criar | ✅ Vendedor |
| PUT | `/api/categorias/:id` | Atualizar | ✅ Vendedor |
| DELETE | `/api/categorias/:id` | Deletar | ✅ Vendedor |

## 🔒 Segurança

### Controle de Acesso
- **Público**: Leitura de produtos, categorias, carrinho
- **Autenticado**: Perfil, histórico pessoal
- **Vendedor**: Criar/editar/deletar produtos e categorias, gerenciar pedidos

### Tokens JWT
- Validade: 7 dias
- Algoritmo: HS256
- Formato: `Bearer <token>`

## 📊 Estrutura do Banco de Dados

### Models
- **Usuario**: Usuários do sistema (vendedor/cliente)
- **Categoria**: Categorias de produtos
- **Produto**: Produtos disponíveis
- **Carrinho**: Carrinhos de compras
- **ItemCarrinho**: Itens dentro do carrinho
- **Pedido**: Pedidos realizados
- **ItemPedido**: Itens dentro dos pedidos

## 🧪 Testes

### Executar testes de autenticação
```bash
node test-auth-native.js
```

Este script testa:
- ✅ Registro de vendedor
- ✅ Registro de cliente
- ✅ Login
- ✅ Criação de produto sem token (deve falhar)
- ✅ Criação de produto com token de vendedor (deve suceder)
- ✅ Criação de produto com token de cliente (deve falhar)
- ✅ Obtenção de perfil

## 📦 Dependências Principais

```json
{
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "@prisma/client": "^5.22.0",
  "bcrypt": "^6.0.0",
  "jsonwebtoken": "^9.0.3",
  "swagger-ui-express": "^4.6.3",
  "swagger-jsdoc": "^6.2.8"
}
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
SECRET_KEY="sua-chave-secreta-aqui"
```

## 🔄 Fluxo de Uso

### Cliente
1. Se não autenticado, usa `clienteId` aleatório
2. Busca/filtra produtos
3. Adiciona ao carrinho
4. Finaliza pedido (sem login obrigatório)
5. Rastreia por número do pedido

### Vendedor
1. Faz login
2. Cria categorias
3. Cria/edita/deleta produtos
4. Visualiza pedidos
5. Atualiza status dos pedidos

## 🚀 Deploy

### Heroku
```bash
git push heroku main
```

### Railway/Render
Conecte seu repositório GitHub

## 📞 Suporte

Para dúvidas ou issues, abra uma [issue no GitHub](https://github.com/Alex-lexi/mix-backend/issues)

## 📄 Licença

ISC

---

**Desenvolvido com ❤️ para o projeto Mix**
