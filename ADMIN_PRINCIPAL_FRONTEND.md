# 🔐 Sistema de Administrador Principal - Documentação para Frontend

## 📋 Visão Geral

O sistema agora possui **três tipos de usuários** com permissões diferentes:

| Tipo | Descrição | Permissões |
|------|-----------|------------|
| **Admin** | Administrador Principal | Criar vendedores, gerenciar tudo |
| **Vendedor** | Vendedor da plataforma | Gerenciar produtos, categorias, pedidos |
| **Cliente** | Cliente da loja | Fazer compras, gerenciar carrinho |

---

## 🔧 Configuração Inicial do Backend

### 1. **Variáveis de Ambiente**

O backend precisa das seguintes variáveis de ambiente no arquivo `.env`:

```bash
# Configuração do Administrador Principal
ADMIN_EMAIL="admin@mixcommerce.com"
ADMIN_SENHA="Admin@123456"
ADMIN_NOME="Administrador Principal"
```

### 2. **Criação Automática do Admin**

O administrador principal é criado **automaticamente** na primeira vez que o servidor inicia:

```bash
npm run dev
```

**Saída esperada:**
```
✅ Administrador principal criado com sucesso:
   Email: admin@mixcommerce.com
   Nome: Administrador Principal
   Tipo: admin
⚠️  IMPORTANTE: Altere a senha após o primeiro login!
```

Se o admin já existir, você verá:
```
✅ Administrador principal já existe: admin@mixcommerce.com
```

---

## 🎯 Mudanças na API

### **1. Registro de Usuários**

#### **Antes** ❌
Qualquer um podia criar vendedores:
```javascript
POST /api/auth/register
{
  "email": "vendedor@exemplo.com",
  "senha": "senha123",
  "nome": "Novo Vendedor",
  "tipo": "vendedor"  // ❌ Qualquer um podia fazer isso
}
```

#### **Depois** ✅
Apenas o **admin autenticado** pode criar vendedores:

**Criar Cliente (Sem autenticação):**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "cliente@exemplo.com",
  "senha": "senha123",
  "nome": "João Silva",
  "tipo": "cliente"  // ✅ Qualquer um pode criar cliente
}
```

**Criar Vendedor (Requer autenticação como admin):**
```javascript
POST /api/auth/register
Content-Type: application/json
Authorization: Bearer {TOKEN_DO_ADMIN}

{
  "email": "vendedor@exemplo.com",
  "senha": "senha123",
  "nome": "Vendedor Novo",
  "tipo": "vendedor"  // ✅ Apenas admin pode fazer isso
}
```

---

## 🚀 Implementação no Frontend

### **1. Verificar Tipo de Usuário**

Após o login, o backend retorna o tipo de usuário:

```javascript
// Resposta do login
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "admin@mixcommerce.com",
    "nome": "Administrador Principal",
    "tipo": "admin"  // 👈 Verifique este campo
  }
}
```

**Salvar no localStorage/state:**
```javascript
// No login bem-sucedido
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, senha })
});

const data = await response.json();

if (data.success) {
  // Salvar token e dados do usuário
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
  
  // Verificar tipo para redirecionar
  switch(data.usuario.tipo) {
    case 'admin':
      window.location.href = '/painel-admin';
      break;
    case 'vendedor':
      window.location.href = '/painel-vendedor';
      break;
    case 'cliente':
      window.location.href = '/loja';
      break;
  }
}
```

---

### **2. Componente de Registro com Controle de Tipo**

```jsx
import { useState } from 'react';

function FormularioRegistro() {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    nome: '',
    tipo: 'cliente', // Padrão: cliente
    telefone: ''
  });

  // Verificar se usuário logado é admin
  const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');
  const ehAdmin = usuarioLogado.tipo === 'admin';
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar headers
    const headers = {
      'Content-Type': 'application/json'
    };

    // Se estiver criando vendedor, incluir token
    if (formData.tipo === 'vendedor') {
      if (!ehAdmin) {
        alert('Apenas administradores podem criar vendedores!');
        return;
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('Usuário criado com sucesso!');
        // Reset form ou redirecionar
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      alert('Erro ao criar usuário');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />

      <input
        type="password"
        placeholder="Senha (mínimo 6 caracteres)"
        value={formData.senha}
        onChange={(e) => setFormData({...formData, senha: e.target.value})}
        required
        minLength={6}
      />

      <input
        type="text"
        placeholder="Nome Completo"
        value={formData.nome}
        onChange={(e) => setFormData({...formData, nome: e.target.value})}
        required
      />

      <input
        type="tel"
        placeholder="Telefone (opcional)"
        value={formData.telefone}
        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
      />

      {/* Mostrar opção de vendedor apenas para admin */}
      {ehAdmin ? (
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({...formData, tipo: e.target.value})}
        >
          <option value="cliente">Cliente</option>
          <option value="vendedor">Vendedor</option>
        </select>
      ) : (
        <input type="hidden" value="cliente" />
      )}

      <button type="submit">
        {formData.tipo === 'vendedor' ? 'Criar Vendedor' : 'Criar Conta'}
      </button>
    </form>
  );
}
```

---

### **3. Painel Admin - Gerenciar Vendedores**

```jsx
import { useState, useEffect } from 'react';

function PainelAdminVendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [novoVendedor, setNovoVendedor] = useState({
    email: '',
    senha: '',
    nome: '',
    telefone: ''
  });

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Carregar lista de vendedores (você precisará criar esse endpoint)
  useEffect(() => {
    carregarVendedores();
  }, []);

  const carregarVendedores = async () => {
    // TODO: Criar endpoint no backend para listar vendedores
    // Por enquanto, você pode buscar todos os usuários e filtrar
  };

  const criarVendedor = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...novoVendedor,
          tipo: 'vendedor'
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Vendedor criado com sucesso!');
        setNovoVendedor({ email: '', senha: '', nome: '', telefone: '' });
        carregarVendedores();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar vendedor');
    }
  };

  return (
    <div>
      <h1>Gerenciar Vendedores</h1>

      {/* Formulário para criar vendedor */}
      <div className="criar-vendedor">
        <h2>Criar Novo Vendedor</h2>
        <form onSubmit={criarVendedor}>
          <input
            type="email"
            placeholder="Email"
            value={novoVendedor.email}
            onChange={(e) => setNovoVendedor({...novoVendedor, email: e.target.value})}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={novoVendedor.senha}
            onChange={(e) => setNovoVendedor({...novoVendedor, senha: e.target.value})}
            required
            minLength={6}
          />

          <input
            type="text"
            placeholder="Nome"
            value={novoVendedor.nome}
            onChange={(e) => setNovoVendedor({...novoVendedor, nome: e.target.value})}
            required
          />

          <input
            type="tel"
            placeholder="Telefone"
            value={novoVendedor.telefone}
            onChange={(e) => setNovoVendedor({...novoVendedor, telefone: e.target.value})}
          />

          <button type="submit">Criar Vendedor</button>
        </form>
      </div>

      {/* Lista de vendedores */}
      <div className="lista-vendedores">
        <h2>Vendedores Cadastrados</h2>
        {/* TODO: Implementar listagem */}
      </div>
    </div>
  );
}
```

---

### **4. Proteger Rotas por Tipo de Usuário**

```jsx
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, tipoPermitido }) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const token = localStorage.getItem('token');

  // Não autenticado
  if (!token || !usuario.tipo) {
    return <Navigate to="/login" />;
  }

  // Verificar tipo de usuário
  if (tipoPermitido && usuario.tipo !== tipoPermitido) {
    return <Navigate to="/acesso-negado" />;
  }

  return children;
}

// Uso no Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rotas do Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute tipoPermitido="admin">
              <PainelAdmin />
            </ProtectedRoute>
          }
        />

        {/* Rotas do Vendedor */}
        <Route
          path="/vendedor/*"
          element={
            <ProtectedRoute tipoPermitido="vendedor">
              <PainelVendedor />
            </ProtectedRoute>
          }
        />

        {/* Rotas do Cliente */}
        <Route
          path="/loja/*"
          element={
            <ProtectedRoute tipoPermitido="cliente">
              <Loja />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### **5. Menu Condicional por Tipo de Usuário**

```jsx
function MenuNavegacao() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <nav>
      <div>Olá, {usuario.nome}</div>

      {/* Menu específico por tipo */}
      {usuario.tipo === 'admin' && (
        <>
          <a href="/admin/dashboard">Dashboard Admin</a>
          <a href="/admin/vendedores">Gerenciar Vendedores</a>
          <a href="/admin/categorias">Categorias</a>
          <a href="/admin/relatorios">Relatórios</a>
        </>
      )}

      {usuario.tipo === 'vendedor' && (
        <>
          <a href="/vendedor/produtos">Meus Produtos</a>
          <a href="/vendedor/pedidos">Pedidos</a>
          <a href="/vendedor/categorias">Categorias</a>
        </>
      )}

      {usuario.tipo === 'cliente' && (
        <>
          <a href="/loja">Loja</a>
          <a href="/carrinho">Carrinho</a>
          <a href="/meus-pedidos">Meus Pedidos</a>
        </>
      )}

      <button onClick={handleLogout}>Sair</button>
    </nav>
  );
}
```

---

## 🔒 Fluxo de Autenticação Completo

### **1. Login do Admin**

```javascript
// Login como administrador
POST /api/auth/login
{
  "email": "admin@mixcommerce.com",
  "senha": "Admin@123456"  // Use a senha definida no .env
}

// Resposta
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "email": "admin@mixcommerce.com",
    "nome": "Administrador Principal",
    "tipo": "admin"  // 👈 Identifica como admin
  }
}
```

### **2. Admin Cria Vendedor**

```javascript
// Admin cria vendedor (requer token)
POST /api/auth/register
Authorization: Bearer {TOKEN_DO_ADMIN}
Content-Type: application/json

{
  "email": "vendedor1@loja.com",
  "senha": "senhaSegura123",
  "nome": "Maria Vendedora",
  "tipo": "vendedor",
  "telefone": "11987654321"
}

// Resposta
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "token": "...",
  "usuario": {
    "id": 2,
    "email": "vendedor1@loja.com",
    "nome": "Maria Vendedora",
    "tipo": "vendedor"
  }
}
```

### **3. Cliente Se Registra**

```javascript
// Cliente cria própria conta (sem token)
POST /api/auth/register
Content-Type: application/json

{
  "email": "cliente@email.com",
  "senha": "senha123",
  "nome": "João Cliente"
  // tipo não especificado = cliente automaticamente
}

// Resposta
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "token": "...",
  "usuario": {
    "id": 3,
    "email": "cliente@email.com",
    "nome": "João Cliente",
    "tipo": "cliente"
  }
}
```

---

## ⚠️ Tratamento de Erros

### **Tentativa de criar vendedor sem ser admin:**

```javascript
// Cliente tenta criar vendedor
POST /api/auth/register
{
  "email": "vendedor@teste.com",
  "senha": "senha123",
  "nome": "Vendedor Teste",
  "tipo": "vendedor"  // ❌ Sem token de admin
}

// Resposta 403
{
  "success": false,
  "message": "Apenas o administrador principal pode criar contas de vendedor"
}
```

**No frontend:**
```javascript
const response = await fetch('/api/auth/register', {...});
const data = await response.json();

if (!data.success) {
  // Mostrar erro específico
  if (response.status === 403) {
    alert('Você não tem permissão para criar vendedores. Apenas o administrador pode fazer isso.');
  } else {
    alert(data.message);
  }
}
```

---

## 📊 Estrutura de Permissões

| Ação | Admin | Vendedor | Cliente |
|------|-------|----------|---------|
| Criar vendedores | ✅ | ❌ | ❌ |
| Gerenciar produtos | ✅ | ✅ | ❌ |
| Criar categorias | ✅ | ✅ | ❌ |
| Ver pedidos | ✅ | ✅ (seus) | ✅ (seus) |
| Adicionar ao carrinho | ✅ | ✅ | ✅ |
| Definir promoções | ✅ | ✅ | ❌ |

---

## 🎨 UI/UX Sugeridas

### **1. Página de Login**
```
┌─────────────────────────────┐
│     Login - Mix Commerce    │
├─────────────────────────────┤
│ Email: [________________]   │
│ Senha: [________________]   │
│         [  Entrar  ]        │
│                             │
│ Não tem conta?              │
│ → Criar conta de cliente    │
└─────────────────────────────┘
```

### **2. Painel Admin**
```
┌─────────────────────────────────────┐
│ Painel Administrativo               │
├─────────────────────────────────────┤
│ [Dashboard] [Vendedores] [Produtos] │
│                                     │
│ Gerenciar Vendedores                │
│ ┌─────────────────────────────────┐ │
│ │ + Criar Novo Vendedor           │ │
│ │                                 │ │
│ │ Lista de Vendedores:            │ │
│ │ • Maria (maria@loja.com)        │ │
│ │ • João (joao@loja.com)          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **3. Fluxo de Registro (Cliente)**
```
Página Pública de Registro
→ Preenche dados (tipo = cliente automaticamente)
→ Cria conta
→ Redireciona para /loja
```

### **4. Fluxo de Criação de Vendedor (Admin)**
```
Admin faz login
→ Acessa /admin/vendedores
→ Preenche formulário de novo vendedor
→ Envia com token do admin no header
→ Vendedor criado com sucesso
```

---

## 🧪 Testando

### **Passo 1: Criar arquivo .env**
```bash
# No backend, criar arquivo .env
ADMIN_EMAIL="admin@mixcommerce.com"
ADMIN_SENHA="Admin@123456"
ADMIN_NOME="Administrador Principal"
JWT_SECRET="sua-chave-secreta"
DATABASE_URL="postgresql://..."
```

### **Passo 2: Iniciar servidor**
```bash
npm run dev
```

### **Passo 3: Fazer login como admin**
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "admin@mixcommerce.com",
  "senha": "Admin@123456"
}
```

### **Passo 4: Criar vendedor**
```bash
POST http://localhost:3000/api/auth/register
Authorization: Bearer {TOKEN_DO_ADMIN}
{
  "email": "vendedor@teste.com",
  "senha": "senha123",
  "nome": "Vendedor Teste",
  "tipo": "vendedor"
}
```

### **Passo 5: Tentar criar vendedor sem ser admin (deve falhar)**
```bash
POST http://localhost:3000/api/auth/register
# Sem Authorization header
{
  "email": "vendedor2@teste.com",
  "senha": "senha123",
  "nome": "Vendedor Teste 2",
  "tipo": "vendedor"
}

# Resposta esperada: 403 Forbidden
```

---

## 📝 Checklist de Implementação Frontend

- [ ] Salvar `tipo` do usuário no localStorage após login
- [ ] Criar componente `ProtectedRoute` para proteger rotas
- [ ] Implementar redirecionamento baseado no `tipo` após login
- [ ] Criar página de painel admin
- [ ] Criar formulário de criação de vendedor (apenas admin)
- [ ] Adicionar verificação de permissão antes de mostrar opção "vendedor"
- [ ] Implementar menu condicional baseado no tipo de usuário
- [ ] Adicionar tratamento de erro 403 (permissão negada)
- [ ] Criar página de "Acesso Negado"
- [ ] Implementar listagem de vendedores (endpoint a ser criado)
- [ ] Adicionar botão "Alterar Senha" no primeiro login do admin
- [ ] Implementar logout (limpar localStorage)

---

## 🚀 Próximos Passos (Backend)

Se você precisar de endpoints adicionais, podemos criar:

1. **Listar todos os vendedores** (apenas admin)
   ```
   GET /api/auth/vendedores
   Authorization: Bearer {TOKEN_ADMIN}
   ```

2. **Desativar/Reativar vendedor** (apenas admin)
   ```
   PUT /api/auth/vendedores/:id/status
   Authorization: Bearer {TOKEN_ADMIN}
   ```

3. **Alterar senha de vendedor** (apenas admin)
   ```
   PUT /api/auth/vendedores/:id/senha
   Authorization: Bearer {TOKEN_ADMIN}
   ```

---

## ✅ Resumo das Mudanças

**Backend:**
- ✅ Administrador principal criado via variável de ambiente
- ✅ Middleware `verificarAdmin` implementado
- ✅ Registro de vendedor requer autenticação como admin
- ✅ Tipo "admin" não pode ser criado via API
- ✅ Documentação Swagger atualizada

**Frontend (a implementar):**
- Verificar `tipo` do usuário após login
- Mostrar opção "vendedor" apenas para admin
- Incluir token ao criar vendedor
- Proteger rotas por tipo de usuário
- Criar painel específico para admin

---

## 📞 Suporte

Se tiver dúvidas durante a implementação:

1. Verifique o tipo do usuário logado: `localStorage.getItem('usuario')`
2. Confirme que o token está sendo enviado: `Authorization: Bearer {token}`
3. Verifique os logs do servidor para mensagens de erro
4. Acesse a documentação Swagger: http://localhost:3000/api-docs
