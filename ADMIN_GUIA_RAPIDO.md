# 🚀 Guia Rápido - Administrador Principal

## ⚡ Setup Rápido (5 minutos)

### 1. Configure as variáveis de ambiente no arquivo `.env`:

```bash
# Copie o .env.example para .env
ADMIN_EMAIL="admin@mixcommerce.com"
ADMIN_SENHA="Admin@123456"
ADMIN_NOME="Administrador Principal"
```

### 2. Inicie o servidor:

```bash
npm run dev
```

**Você verá:**
```
✅ Administrador principal criado com sucesso:
   Email: admin@mixcommerce.com
   Nome: Administrador Principal
   Tipo: admin
```

### 3. Teste o sistema:

```bash
./test-admin.ps1
```

---

## 🔑 Credenciais Padrão

**Administrador:**
- Email: `admin@mixcommerce.com`
- Senha: `Admin@123456`
- Tipo: `admin`

⚠️ **Altere a senha em produção!**

---

## 📱 Implementação no Frontend

### Login e Verificação de Tipo

```javascript
// 1. Fazer login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@mixcommerce.com',
    senha: 'Admin@123456'
  })
});

const data = await response.json();

// 2. Salvar dados do usuário
localStorage.setItem('token', data.token);
localStorage.setItem('usuario', JSON.stringify(data.usuario));

// 3. Verificar tipo e redirecionar
switch(data.usuario.tipo) {
  case 'admin':
    window.location.href = '/admin/dashboard';
    break;
  case 'vendedor':
    window.location.href = '/vendedor/produtos';
    break;
  case 'cliente':
    window.location.href = '/loja';
    break;
}
```

### Criar Vendedor (Apenas Admin)

```javascript
// Verificar se é admin
const usuario = JSON.parse(localStorage.getItem('usuario'));
const ehAdmin = usuario.tipo === 'admin';

if (!ehAdmin) {
  alert('Apenas admin pode criar vendedores!');
  return;
}

// Criar vendedor
const token = localStorage.getItem('token');

const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // 👈 Token obrigatório
  },
  body: JSON.stringify({
    email: 'vendedor@loja.com',
    senha: 'senha123',
    nome: 'Novo Vendedor',
    tipo: 'vendedor'  // 👈 Requer admin
  })
});

const data = await response.json();

if (data.success) {
  alert('Vendedor criado com sucesso!');
}
```

### Registro Público (Cliente)

```javascript
// Clientes podem se registrar sem autenticação
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cliente@email.com',
    senha: 'senha123',
    nome: 'João Cliente'
    // tipo: 'cliente' é o padrão, não precisa enviar
  })
});
```

---

## 🛡️ Regras de Segurança

| Ação | Precisa Auth? | Tipo Permitido |
|------|---------------|----------------|
| **Criar cliente** | ❌ Não | Qualquer um |
| **Criar vendedor** | ✅ Sim | Apenas `admin` |
| **Login** | ❌ Não | Todos |
| **Ver produtos** | ❌ Não | Todos |
| **Criar produtos** | ✅ Sim | `admin`, `vendedor` |
| **Gerenciar carrinho** | ✅ Sim | Todos autenticados |

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────┐
│  1. Admin faz login                 │
│     → Recebe token com tipo='admin' │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  2. Admin cria vendedor             │
│     → Envia token no header         │
│     → Backend verifica tipo='admin' │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  3. Vendedor criado                 │
│     → Recebe credenciais            │
│     → Pode fazer login              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  4. Vendedor gerencia produtos      │
└─────────────────────────────────────┘
```

---

## ⚠️ Erros Comuns

### Erro 403 ao criar vendedor

```json
{
  "success": false,
  "message": "Apenas o administrador principal pode criar contas de vendedor"
}
```

**Causa:** Tentou criar vendedor sem token de admin

**Solução:**
1. Faça login como admin
2. Use o token no header: `Authorization: Bearer {token}`
3. Certifique-se que `usuario.tipo === 'admin'`

### Admin não foi criado

**Causa:** Variáveis de ambiente não definidas

**Solução:**
1. Crie arquivo `.env` na raiz do projeto
2. Adicione: `ADMIN_EMAIL`, `ADMIN_SENHA`, `ADMIN_NOME`
3. Reinicie o servidor

---

## 🎯 Componente React de Exemplo

```jsx
function FormularioCriarVendedor() {
  const [formData, setFormData] = useState({
    email: '', senha: '', nome: '', telefone: ''
  });

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  // Verificar se é admin
  if (usuario.tipo !== 'admin') {
    return <div>Acesso negado. Apenas admin pode criar vendedores.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...formData,
        tipo: 'vendedor'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      alert('Vendedor criado!');
      setFormData({ email: '', senha: '', nome: '', telefone: '' });
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Novo Vendedor</h2>
      
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
        placeholder="Telefone"
        value={formData.telefone}
        onChange={(e) => setFormData({...formData, telefone: e.target.value})}
      />

      <button type="submit">Criar Vendedor</button>
    </form>
  );
}
```

---

## 📚 Documentação Completa

- [ADMIN_PRINCIPAL_FRONTEND.md](ADMIN_PRINCIPAL_FRONTEND.md) - Guia completo para frontend
- [Swagger API](http://localhost:3000/api-docs) - Testar endpoints
- `.env.example` - Exemplo de configuração

---

## ✅ Checklist

Backend:
- [x] Administrador criado via .env
- [x] Middleware verificarAdmin implementado
- [x] Apenas admin pode criar vendedores
- [x] Tipo 'admin' protegido (não pode ser criado via API)
- [x] Swagger atualizado

Frontend (a fazer):
- [ ] Salvar tipo do usuário após login
- [ ] Redirecionar baseado no tipo
- [ ] Formulário de criar vendedor (apenas admin)
- [ ] Proteger rotas por tipo
- [ ] Menu condicional por tipo
