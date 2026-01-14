# 📖 Guia de Desenvolvimento - Mix Backend

## 🎯 Roadmap Concluído

### ✅ Backend
- [x] Servidor Express com ES Modules
- [x] Banco de dados Prisma com SQLite
- [x] CRUD de Categorias
- [x] CRUD de Produtos (com cores e tamanhos)
- [x] Sistema de Carrinho (clienteId + usuário autenticado)
- [x] Sistema de Pedidos
- [x] Validações robustas (email, telefone, preço, etc)
- [x] Filtros avançados (preço, categoria, cor, tamanho, busca global)
- [x] Autenticação JWT com 2 roles (vendedor/cliente)
- [x] Controle de acesso baseado em roles
- [x] Documentação Swagger
- [x] Testes de autenticação

### ⏳ Próximas Prioridades

#### 1️⃣ URGENTE - Melhorias de Backend
- [ ] Adicionar validação de estoque antes de criar pedido
- [ ] Implementar sistema de avaliações/comentários de produtos
- [ ] Adicionar cupons de desconto
- [ ] Sistema de wishlist/favoritos
- [ ] Filtrar pedidos por usuário autenticado (get user's orders)
- [ ] Testes unitários (Jest)
- [ ] Upload de imagens (Multer + Storage)

#### 2️⃣ IMPORTANTE - Frontend (Admin Panel)
Painel administrativo para vendedores:
- Autenticação (login de vendedor)
- Dashboard com estatísticas
- CRUD de Categorias
- CRUD de Produtos
- Gerenciador de Pedidos
- Atualizar status de pedidos
- Análise de vendas

#### 3️⃣ IMPORTANTE - Frontend (Client App)
App de cliente:
- Navegação de produtos
- Busca e filtros
- Carrinho de compras
- Checkout (sem necessidade de login)
- Histórico de pedidos (se logado)
- Rastreamento de pedidos
- Avaliações de produtos

---

## 🛠️ Estrutura de Diretórios

```
mix-backend/
├── src/
│   ├── controllers/          # Lógica de negócio
│   │   ├── authController.js
│   │   ├── categoriaController.js
│   │   ├── produtoController.js
│   │   ├── carrinhoController.js
│   │   └── pedidoController.js
│   ├── routes/              # Definições de rotas
│   │   ├── authRoutes.js
│   │   ├── categoriaRoutes.js
│   │   ├── produtoRoutes.js
│   │   ├── carrinhoRoutes.js
│   │   └── pedidoRoutes.js
│   ├── middlewares/         # Middlewares (auth, validação)
│   │   ├── authMiddleware.js
│   │   └── validacoes.js
│   └── swagger.js           # Configuração Swagger
├── prisma/
│   ├── schema.prisma        # Schema do banco de dados
│   └── migrations/          # Histórico de migrações
├── dev.db                   # Banco de dados SQLite
├── index.js                 # Arquivo principal
├── package.json             # Dependências
├── README.md                # Documentação
├── CURL_EXAMPLES.md         # Exemplos de testes
├── test-auth-native.js      # Script de testes
└── test-autenticacao.ps1    # Script PowerShell de testes
```

---

## 🔒 Modelo de Segurança

### Tipos de Usuário

#### Cliente
- Pode: Navegar produtos, adicionar ao carrinho, criar pedidos
- Não pode: Criar/editar produtos, ver pedidos de outros

#### Vendedor
- Pode: Criar/editar/deletar produtos, ver todos os pedidos, atualizar status
- Não pode: Comprar como cliente (tem carrinho separado)

### Fluxo de Autenticação

```
1. Cliente se registra com tipo "cliente"
2. Vendedor se registra com tipo "vendedor"
3. Login gera token JWT com { userId, email, tipo }
4. Endpoints verificam token e tipo de usuário
5. Middleware retorna 401 (sem token) ou 403 (sem permissão)
```

---

## 🗄️ Schema do Banco de Dados

### Usuario
```prisma
model Usuario {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  senha     String   (hash bcrypt)
  nome      String
  tipo      String   (vendedor/cliente)
  telefone  String?
  pedidos   Pedido[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Produto
```prisma
model Produto {
  id          Int      @id @default(autoincrement())
  nome        String
  preco       Float
  descricao   String
  imagem      String
  quantidade  Int
  cor         String?
  tamanho     String?
  categoria   Categoria @relation(fields: [categoriaId], references: [id])
  categoriaId Int
  itens       ItemCarrinho[]
  pedidoItens ItemPedido[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 📦 Dependências Principais

### Runtime
```json
{
  "express": "^5.2.1",
  "cors": "^2.8.5",
  "@prisma/client": "^5.22.0",
  "bcrypt": "^6.0.0",
  "jsonwebtoken": "^9.0.3",
  "node-fetch": "^3.3.2"
}
```

### Development & Documentation
```json
{
  "prisma": "^5.22.0",
  "swagger-ui-express": "^4.6.3",
  "swagger-jsdoc": "^6.2.8"
}
```

---

## 🚀 Melhorias Sugeridas

### 1. Validação Mais Rigorosa
```javascript
// Validar estoque antes de criar pedido
// Validar limites de quantidade
// Validar CPF/CNPJ para vendedores
```

### 2. Autenticação Avançada
```javascript
// OAuth2 (Google, Facebook)
// Two-factor authentication
// Refresh tokens
// Roles mais granulares
```

### 3. Performance
```javascript
// Cache com Redis
// Paginação em todas as listas
// Índices de banco de dados
// Compressão de responses
```

### 4. Observabilidade
```javascript
// Winston/Morgan para logging
// Sentry para error tracking
// Métricas (Prometheus)
// Trace distribuído
```

### 5. Upload de Imagens
```javascript
// Multer para upload
// Sharp para processamento
// AWS S3 ou similar para armazenamento
// CDN para distribuição
```

---

## 🧪 Estratégia de Testes

### Testes Unitários (Controllers)
```javascript
// test/controllers/authController.test.js
describe('authController.register', () => {
  it('deve registrar novo usuário', async () => {
    // ...
  });
  
  it('deve rejeitar email inválido', async () => {
    // ...
  });
});
```

### Testes de Integração (Routes)
```javascript
// test/routes/auth.test.js
describe('POST /api/auth/register', () => {
  it('deve retornar token JWT', async () => {
    // ...
  });
});
```

### Testes E2E (Fluxo Completo)
```javascript
// test/e2e/shopping.test.js
describe('Shopping flow', () => {
  it('deve criar pedido completo', async () => {
    // 1. Registrar cliente
    // 2. Adicionar ao carrinho
    // 3. Criar pedido
    // 4. Verificar pedido
  });
});
```

---

## 📝 Convenções de Código

### Nomenclatura

**Controllers** - nomeados pelo recurso
```javascript
src/controllers/
  - authController.js
  - produtoController.js
  - carrinhoController.js
```

**Routes** - plural do recurso
```javascript
src/routes/
  - authRoutes.js
  - produtoRoutes.js
  - carrinhoRoutes.js
```

**Funções** - camelCase, verbo + substantivo
```javascript
// Controllers
register()
login()
obterPerfil()
criarProduto()
atualizarProduto()
deletarProduto()

// Middlewares
verificarToken()
verificarVendedor()
validarEmail()
```

### Responses Padronizadas

**Sucesso**
```javascript
{
  success: true,
  data: { ... },
  message: "Operação concluída"
}
```

**Erro**
```javascript
{
  success: false,
  message: "Descrição do erro",
  status: 400
}
```

---

## 🔄 Fluxo de Desenvolvimento

### Criar novo endpoint

1. **Criar controller**
```javascript
// src/controllers/novoController.js
export const novaFuncao = async (req, res) => {
  try {
    // Lógica
    res.json({ success: true, data: ... });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

2. **Criar rota**
```javascript
// src/routes/novoRoutes.js
router.post('/', novaFuncao);
```

3. **Registrar rota**
```javascript
// index.js
import novoRoutes from './src/routes/novoRoutes.js';
app.use('/api/novo', novoRoutes);
```

4. **Documentar Swagger**
```javascript
/**
 * @swagger
 * /api/novo:
 *   post:
 *     description: Descrição
 */
```

5. **Testar**
```bash
curl -X POST http://localhost:3000/api/novo \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

---

## 🚨 Tratamento de Erros

### Códigos Recomendados

| Situação | Código | Exemplo |
|----------|--------|---------|
| Sucesso | 200 | GET, PUT, DELETE |
| Criado | 201 | POST (criar recurso) |
| Erro validação | 400 | Email inválido, dados faltando |
| Sem autenticação | 401 | Token faltando ou expirado |
| Sem autorização | 403 | Cliente tentando deletar produto |
| Não encontrado | 404 | Produto não existe |
| Conflito | 409 | Email já cadastrado |
| Erro servidor | 500 | Bug inesperado |

---

## 📚 Recursos Úteis

- [Documentação Express](https://expressjs.com/)
- [Documentação Prisma](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [RESTful API Guidelines](https://restfulapi.net/)
- [Swagger/OpenAPI Spec](https://spec.openapis.org/oas/v3.1.0)

---

## ❓ FAQ

**P: Como adicionar novo tipo de usuário?**
A: Atualize o campo `tipo` no schema Prisma e adicione novo middleware de verificação.

**P: Como mudar o banco de dados de SQLite para PostgreSQL?**
A: Atualize `DATABASE_URL` em `.env` e execute `npx prisma migrate reset`.

**P: Como resetar a senha?**
A: Implemente endpoint PUT /api/auth/reset-password com token temporal.

**P: Como lidar com imagens de produtos?**
A: Use Multer para upload e armazene em S3/Cloud Storage.

**P: Preciso proteger todos os endpoints?**
A: Não, apenas os que modificam dados (POST, PUT, DELETE) quando apropriado.

---

**Última atualização**: Dezembro 2024
**Versão Backend**: 1.0.0
**Status**: Em desenvolvimento
