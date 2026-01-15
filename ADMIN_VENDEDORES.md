# API de Gerenciamento de Vendedores - Painel Admin

## 📋 Visão Geral

Este documento descreve o endpoint da API para listar e gerenciar vendedores no painel administrativo. O problema relatado de não conseguir visualizar vendedores após cadastrar o primeiro foi corrigido com a implementação desta funcionalidade.

## 🔧 Implementação Realizada no Backend

### Endpoint Criado

```
GET /api/auth/vendedores
```

**Autenticação:** Obrigatória (Bearer Token)  
**Autorização:** Apenas administrador principal  
**Retorna:** Lista completa de todos os vendedores cadastrados

---

## 📡 Especificação da API

### Request

#### Headers
```http
Authorization: Bearer {token_admin}
Content-Type: application/json
```

#### Método
```
GET /api/auth/vendedores
```

### Response

#### Sucesso (200)
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": 5,
      "email": "maria@loja.com",
      "nome": "Maria Silva",
      "telefone": "11987654321",
      "createdAt": "2026-01-15T14:30:00.000Z",
      "updatedAt": "2026-01-15T14:30:00.000Z"
    },
    {
      "id": 3,
      "email": "joao@loja.com",
      "nome": "João Santos",
      "telefone": "11998765432",
      "createdAt": "2026-01-14T10:15:00.000Z",
      "updatedAt": "2026-01-14T10:15:00.000Z"
    }
  ]
}
```

#### Erro - Token não fornecido (401)
```json
{
  "success": false,
  "message": "Token não fornecido"
}
```

#### Erro - Não é administrador (403)
```json
{
  "success": false,
  "message": "Acesso negado. Apenas o administrador principal pode executar esta ação"
}
```

#### Erro - Token inválido (401)
```json
{
  "success": false,
  "message": "Token inválido ou expirado",
  "error": "jwt malformed"
}
```

#### Erro no servidor (500)
```json
{
  "success": false,
  "message": "Erro ao listar vendedores",
  "error": "Detalhes do erro"
}
```

---

## 🗑️ Deletar Vendedor (Admin)

### Endpoint

```http
DELETE /api/auth/vendedores/{id}
```

**Autenticação:** Obrigatória (Bearer Token)  
**Autorização:** Apenas administrador principal  
**Regra:** Somente usuários com `tipo = "vendedor"` podem ser removidos por esta rota.

### Request

#### Headers
```http
Authorization: Bearer {token_admin}
Content-Type: application/json
```

#### Parâmetros de rota
- `id` (number) – ID do vendedor que será deletado.

### Respostas

#### Sucesso (200)
```json
{
  "success": true,
  "message": "Vendedor deletado com sucesso"
}
```

#### Vendedor não encontrado (404)
```json
{
  "success": false,
  "message": "Vendedor não encontrado"
}
```

#### Usuário não é vendedor (400)
```json
{
  "success": false,
  "message": "Apenas usuários do tipo vendedor podem ser deletados por esta rota"
}
```

#### Não autorizado (401)
```json
{
  "success": false,
  "message": "Token não fornecido"
}
```

#### Acesso negado (403)
```json
{
  "success": false,
  "message": "Acesso negado. Apenas o administrador principal pode executar esta ação"
}
```

---

## 🎨 Implementação no Frontend

### 1. Criar Serviço da API

```javascript
// services/api.js ou services/vendedorService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const listarVendedores = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/vendedores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao listar vendedores');
    }

    return data;
  } catch (error) {
    console.error('Erro ao listar vendedores:', error);
    throw error;
  }
};
```

### 2. Componente React - Listagem de Vendedores

```jsx
import React, { useState, useEffect } from 'react';
import { listarVendedores } from '../services/api';

const ListaVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    carregarVendedores();
  }, []);

  const carregarVendedores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter token do localStorage, sessionStorage ou context
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
      }

      const response = await listarVendedores(token);
      
      setVendedores(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar vendedores:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Carregando vendedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={carregarVendedores}>Tentar Novamente</button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="empty-state">
        <h3>Nenhum vendedor cadastrado</h3>
        <p>Cadastre o primeiro vendedor para começar</p>
        <button onClick={() => {/* Navegar para tela de cadastro */}}>
          Cadastrar Vendedor
        </button>
      </div>
    );
  }

  return (
    <div className="vendedores-container">
      <div className="header">
        <h2>Vendedores Cadastrados</h2>
        <span className="badge">{total} {total === 1 ? 'vendedor' : 'vendedores'}</span>
      </div>

      <div className="vendedores-lista">
        {vendedores.map((vendedor) => (
          <div key={vendedor.id} className="vendedor-card">
            <div className="vendedor-info">
              <h3>{vendedor.nome}</h3>
              <p className="email">{vendedor.email}</p>
              {vendedor.telefone && (
                <p className="telefone">{vendedor.telefone}</p>
              )}
            </div>
            
            <div className="vendedor-meta">
              <span className="data-cadastro">
                Cadastrado em: {formatarData(vendedor.createdAt)}
              </span>
            </div>

            <div className="vendedor-acoes">
              <button className="btn-editar">Editar</button>
              <button className="btn-desativar">Desativar</button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-adicionar" onClick={() => {/* Navegar para cadastro */}}>
        + Adicionar Novo Vendedor
      </button>
    </div>
  );
};

export default ListaVendedores;
```

### 3. Exemplo com Axios (alternativa)

```javascript
// services/vendedorService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const listarVendedores = async () => {
  try {
    const response = await api.get('/api/auth/vendedores');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
```

### 4. Hook Customizado (React)

```javascript
// hooks/useVendedores.js
import { useState, useEffect } from 'react';
import { listarVendedores } from '../services/api';

export const useVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const carregarVendedores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await listarVendedores(token);
      
      setVendedores(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarVendedores();
  }, []);

  return {
    vendedores,
    total,
    loading,
    error,
    recarregar: carregarVendedores
  };
};

// Uso no componente:
// const { vendedores, total, loading, error, recarregar } = useVendedores();
```

---

## 🎯 Fluxo Recomendado no Frontend

### 1. Ao Entrar no Painel Admin

```javascript
// Página: PainelAdmin.jsx
useEffect(() => {
  // Verificar se é admin
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  
  if (usuario?.tipo !== 'admin') {
    // Redirecionar ou mostrar erro
    navigate('/login');
    return;
  }

  // Carregar vendedores automaticamente
  carregarVendedores();
}, []);
```

### 2. Após Cadastrar Novo Vendedor

```javascript
const handleCadastroSucesso = async () => {
  // Mostrar mensagem de sucesso
  toast.success('Vendedor cadastrado com sucesso!');
  
  // Recarregar lista de vendedores
  await recarregar();
  
  // Fechar modal/formulário
  setMostrarFormulario(false);
};
```

### 3. Gerenciar Estado de Carregamento

```javascript
// Mostrar diferentes estados
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} onRetry={recarregar} />;
if (total === 0) return <EstadoVazio onCadastrar={abrirFormulario} />;
return <ListaVendedores vendedores={vendedores} total={total} />;
```

---

## 🔐 Segurança e Tratamento de Erros

### Verificações Importantes

1. **Sempre verificar se o token existe**
```javascript
const token = localStorage.getItem('token');
if (!token) {
  // Redirecionar para login
  navigate('/login');
  return;
}
```

2. **Tratar erro 403 (não autorizado)**
```javascript
if (error.response?.status === 403) {
  // Usuário não é admin
  toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
  navigate('/');
}
```

3. **Tratar erro 401 (token expirado)**
```javascript
if (error.response?.status === 401) {
  // Token expirado ou inválido
  localStorage.removeItem('token');
  toast.error('Sessão expirada. Faça login novamente.');
  navigate('/login');
}
```

---

## 📱 Exemplo de CSS Básico

```css
.vendedores-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.badge {
  background: #007bff;
  color: white;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
}

.vendedores-lista {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.vendedor-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.vendedor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.vendedor-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.email {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.telefone {
  color: #888;
  font-size: 14px;
  margin: 5px 0;
}

.vendedor-meta {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.data-cadastro {
  font-size: 12px;
  color: #999;
}

.vendedor-acoes {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-editar,
.btn-desativar {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn-editar {
  background: #28a745;
  color: white;
}

.btn-desativar {
  background: #dc3545;
  color: white;
}

.btn-editar:hover,
.btn-desativar:hover {
  opacity: 0.8;
}

.btn-adicionar {
  width: 100%;
  padding: 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-adicionar:hover {
  background: #0056b3;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-state h3 {
  color: #666;
  margin-bottom: 10px;
}

.empty-state p {
  color: #999;
  margin-bottom: 30px;
}

.error-container {
  text-align: center;
  padding: 40px 20px;
}

.error-message {
  color: #dc3545;
  margin-bottom: 20px;
}

.loading-container {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}
```

---

## ✅ Checklist de Implementação

### Backend (✓ Concluído)
- [x] Função `listarVendedores` criada no authController
- [x] Rota GET `/api/auth/vendedores` adicionada
- [x] Middleware de autenticação aplicado
- [x] Middleware de verificação admin aplicado
- [x] Documentação Swagger completa
- [x] Retorna lista ordenada por data (mais recentes primeiro)

### Frontend (Para Implementar)
- [ ] Criar serviço da API para listar vendedores
- [ ] Criar componente de listagem de vendedores
- [ ] Implementar estados de carregamento
- [ ] Implementar tratamento de erros
- [ ] Criar estado vazio (quando não há vendedores)
- [ ] Adicionar botão para cadastrar novo vendedor
- [ ] Implementar atualização automática após cadastro
- [ ] Adicionar formatação de datas
- [ ] Estilizar componentes
- [ ] Testar fluxo completo

---

## 🧪 Testando a API

### Usando cURL

```bash
# Listar vendedores (substitua SEU_TOKEN pelo token do admin)
curl -X GET http://localhost:3000/api/auth/vendedores \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json"
```

### Usando PowerShell

```powershell
$token = "SEU_TOKEN_ADMIN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/vendedores" `
    -Method GET `
    -Headers $headers

$response | ConvertTo-Json -Depth 5
```

### Resultado Esperado

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": 3,
      "email": "vendedor2@loja.com",
      "nome": "Carlos Vendedor",
      "telefone": "11999887766",
      "createdAt": "2026-01-15T15:20:00.000Z",
      "updatedAt": "2026-01-15T15:20:00.000Z"
    },
    {
      "id": 2,
      "email": "vendedor1@loja.com",
      "nome": "Ana Vendedora",
      "telefone": "11988776655",
      "createdAt": "2026-01-14T10:30:00.000Z",
      "updatedAt": "2026-01-14T10:30:00.000Z"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Problema: Lista sempre vazia mesmo com vendedores cadastrados

**Solução:** Verificar se os usuários foram criados com `tipo: 'vendedor'`
```sql
-- Verificar no banco de dados
SELECT id, email, nome, tipo FROM "Usuario" WHERE tipo = 'vendedor';
```

### Problema: Erro 403 ao acessar endpoint

**Solução:** Verificar se o usuário logado é realmente admin
```javascript
// Decodificar token JWT para verificar
const decodedToken = jwt.decode(token);
console.log('Tipo de usuário:', decodedToken.tipo); // Deve ser 'admin'
```

### Problema: Vendedores não aparecem na ordem correta

**Solução:** O backend já ordena por `createdAt desc`. Verificar se a resposta está sendo processada corretamente no frontend.

---

## 📚 Recursos Adicionais

- **Documentação Swagger:** `http://localhost:3000/api-docs`
- **Endpoint:** `GET /api/auth/vendedores`
- **Autenticação:** Bearer Token (Admin)
- **Arquivo do Controller:** `src/controllers/authController.js`
- **Arquivo de Rotas:** `src/routes/authRoutes.js`

---

## 📞 Suporte

Se tiver dúvidas sobre a implementação no frontend:
1. Consulte a documentação Swagger em `/api-docs`
2. Verifique os exemplos de código neste documento
3. Teste a API diretamente usando cURL ou Postman
4. Certifique-se de que o token do admin está sendo enviado corretamente

---

**Última atualização:** 15 de janeiro de 2026  
**Versão da API:** 1.0.0
