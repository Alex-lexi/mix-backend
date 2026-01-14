# ⚡ Quick Start Guide - Mix Backend

## 🚀 5 Minutos Para Começar

### 1. Iniciar o Servidor
```bash
cd mix-backend
node index.js
```

**Output esperado:**
```
Servidor rodando em http://localhost:3000
📚 Documentação Swagger: http://localhost:3000/api-docs
```

### 2. Testar a API

#### Opção A: Swagger UI (Recomendado)
Abra: **http://localhost:3000/api-docs**

#### Opção B: Testes Automatizados
```bash
node test-auth-native.js
```

#### Opção C: cURL
```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"123456","nome":"Test","tipo":"cliente"}'

# Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","senha":"123456"}'

# Listar produtos
curl http://localhost:3000/api/produtos
```

---

## 📚 Documentação Rápida

### Links Principais
- 📖 **README.md** - Visão geral completa
- 🏗️ **ARCHITECTURE.md** - Fluxos e diagramas
- 🔍 **CURL_EXAMPLES.md** - 30+ exemplos
- 🛠️ **DEVELOPMENT.md** - Convenções e patterns
- 🚀 **NEXT_STEPS.md** - O que fazer depois
- ✅ **CHECKLIST.md** - O que foi entregue

### Índice Completo
- 📋 **INDEX.md** - Navegação por funcionalidade

---

## 🔑 Endpoints Principais (6 segundos)

### Autenticação
```
POST   /api/auth/register        Registrar
POST   /api/auth/login           Login
GET    /api/auth/perfil          Meu perfil
PUT    /api/auth/perfil          Editar perfil
```

### Produtos
```
GET    /api/produtos             Listar
GET    /api/produtos/:id         Obter
GET    /api/produtos/busca/search?nome=x   Buscar
POST   /api/produtos             Criar (vendedor)
PUT    /api/produtos/:id         Editar (vendedor)
DELETE /api/produtos/:id         Deletar (vendedor)
```

### Carrinho
```
GET    /api/carrinho/:clienteId              Obter
POST   /api/carrinho/:clienteId/adicionar    Adicionar
DELETE /api/carrinho/:clienteId/remover/:id  Remover
DELETE /api/carrinho/:clienteId/limpar       Limpar
```

### Pedidos
```
POST   /api/pedidos              Criar
GET    /api/pedidos/:id          Obter
GET    /api/pedidos/numero/:num  Por número
PUT    /api/pedidos/:id/status   Atualizar status (vendedor)
```

---

## 👤 Usuários de Teste

### Vendedor (Já Existe)
```
Email: vendedor@example.com
Senha: senha123456
Tipo:  vendedor
```

### Cliente (Já Existe)
```
Email: cliente@example.com
Senha: senha123456
Tipo:  cliente
```

Ou registre novos:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo@test.com",
    "senha": "123456",
    "nome": "Nome",
    "tipo": "cliente"
  }'
```

---

## 🔐 Como Usar Token

1. **Fazer login** e pegar token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendedor@example.com","senha":"senha123456"}'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  ...
}
```

2. **Usar token em requisições**:
```bash
curl -X GET http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## ✨ Funcionalidades Chave

### ✅ Autenticação JWT
- Registro com email/senha
- Login retorna token
- Token válido por 7 dias
- Senhas com bcrypt

### ✅ Dois Tipos de Usuário
- **Cliente**: Compra produtos
- **Vendedor**: Gerencia produtos e pedidos

### ✅ CRUD Completo
- Produtos, Categorias, Carrinho, Pedidos
- Validações em cada campo
- Tratamento de erro

### ✅ Busca & Filtros
- Busca por nome
- Busca global (em tudo)
- Filtrar por preço, categoria, cor, tamanho

### ✅ Carrinho Inteligente
- Funciona sem login (clienteId)
- Funciona com login (usuarioId)
- Cálculo automático

### ✅ Documentação
- Swagger UI em /api-docs
- 7 arquivos de documentação
- 30+ exemplos de cURL

---

## 📊 Stack Tecnológico (30 segundos)

```
Frontend:      React / Vue (para construir)
Backend:       Node.js + Express
Banco:         SQLite + Prisma ORM
Autenticação:  JWT + bcrypt
Documentação:  Swagger/OpenAPI
```

---

## ⚠️ Erros Comuns

### "Servidor não inicia"
```bash
# Verificar se porta 3000 está livre
netstat -ano | findstr :3000

# Se estiver usando, matar processo
taskkill /F /IM node.exe
```

### "Database error"
```bash
# Resetar banco (apaga dados!)
npx prisma migrate reset

# Ou re-aplicar migrations
npx prisma migrate dev
```

### "Swagger não aparece"
```
Certifique que servidor está rodando
Acesse: http://localhost:3000/api-docs
```

### "Token inválido"
```
1. Certifique que está usando Bearer token
2. Header deve ser: Authorization: Bearer <token>
3. Não esqueça "Bearer " antes do token
```

---

## 🎯 Próximo Passo (Você)

### Opção 1: Testar a API
1. Abra http://localhost:3000/api-docs
2. Clique em "Try it out"
3. Teste alguns endpoints

### Opção 2: Ler a Documentação
1. Leia README.md (15 min)
2. Leia ARCHITECTURE.md (20 min)
3. Consulte CURL_EXAMPLES.md conforme necessário

### Opção 3: Começar Frontend
1. Leia NEXT_STEPS.md - seção "Frontend"
2. Crie novo projeto React/Vue
3. Comece integrando endpoints

### Opção 4: Melhorar Backend
1. Leia DEVELOPMENT.md
2. Consulte NEXT_STEPS.md - seção "Backend Melhorias"
3. Implemente novas features

---

## 💡 Dicas Rápidas

### Ver dados do banco
```bash
npx prisma studio
```

### Resetar banco (cuidado!)
```bash
npx prisma migrate reset
```

### Instalar nova dependência
```bash
npm install <pacote>
```

### Executar database migration
```bash
npx prisma migrate dev --name <nome>
```

---

## 📞 Precisa de Ajuda?

1. **Leia**: INDEX.md (navegação por funcionalidade)
2. **Consulte**: CURL_EXAMPLES.md (exemplos práticos)
3. **Estude**: Código em src/controllers/
4. **Teste**: http://localhost:3000/api-docs

---

## ✅ Verificação Rápida

```bash
# Servidor está rodando?
curl http://localhost:3000/

# API está respondendo?
curl http://localhost:3000/api/produtos

# Swagger está acessível?
Abra: http://localhost:3000/api-docs

# Testes passam?
node test-auth-native.js
```

---

## 🎉 Tudo Pronto!

Você tem uma **API de e-commerce completa e funcional**.

Próximo: Desenvolver o frontend e fazer deploy.

**Boa sorte! 🚀**

---

**Dúvidas?** Consulte a documentação.
**Quer contribuir?** Leia DEVELOPMENT.md.
**Pronto para deploy?** Consulte NEXT_STEPS.md.
