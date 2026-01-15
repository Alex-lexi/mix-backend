# API de Promoções - Painel Admin e Vendedores

## 📋 Visão Geral

Este documento descreve como **editar** e **remover (deletar)** promoções de produtos no painel administrativo. 

- Quem pode gerenciar promoções:
  - ✅ Administrador principal (`tipo: "admin"`)
  - ✅ Usuários vendedores (`tipo: "vendedor"`)
- Clientes **não** podem criar/editar/remover promoções.

A lógica já está implementada no backend utilizando os campos:
- `Produto.emPromocao: boolean`
- `Produto.precoPromocional: number | null`

Remover uma promoção significa:
- `emPromocao = false`
- `precoPromocional = null`

---

## 🔐 Autenticação e Autorização

- Autenticação: **Obrigatória** (JWT Bearer Token)
- Autorização: apenas **admin** ou **vendedor**
- Middleware usado nas rotas: `verificarToken` + `verificarVendedorOuAdmin`

Se o usuário logado não for `admin` nem `vendedor`, a API retorna **403**.

---

## 📡 Endpoints Envolvidos

### 1. Listar Produtos em Promoção (para tela de listagem de promoções)

```http
GET /api/produtos/promocoes/lista
```

- **Auth:** não obrigatório (pode ser usado no site público ou painel)
- **Uso no painel admin:** listar todos os produtos que atualmente estão com `emPromocao = true`.

**Query opcional:**
- `limit` (number) – número máximo de itens retornados (padrão 10)

**Resposta 200 (exemplo):**
```json
{
  "success": true,
  "total": 3,
  "data": [
    {
      "id": 10,
      "nome": "Notebook Gamer",
      "preco": 4999.0,
      "emPromocao": true,
      "precoPromocional": 3999.0,
      "categoria": {
        "id": 2,
        "nome": "Eletrônicos"
      }
    }
  ]
}
```

---

### 2. Criar / Editar Promoção de um Produto

```http
PUT /api/produtos/{id}/promocao
```

- **Função:**
  - Se o produto **não tinha promoção**, este endpoint **cria** a promoção.
  - Se o produto **já estava em promoção**, este endpoint **edita** a promoção (altera `precoPromocional`).
- **Auth:** obrigatório (Bearer Token de **admin** ou **vendedor**).

#### Headers
```http
Authorization: Bearer {token_admin_ou_vendedor}
Content-Type: application/json
```

#### Parâmetros de rota
- `id` – ID do produto que terá a promoção criada/atualizada.

#### Body (exemplo - criar/editar)
```json
{
  "emPromocao": true,
  "precoPromocional": 79.9
}
```

#### Regras de validação
- `emPromocao` é **obrigatório**.
- Quando `emPromocao = true`:
  - `precoPromocional` é **obrigatório**.
  - `precoPromocional` **deve ser menor** que o `preco` normal do produto.
  - `precoPromocional` **deve ser maior que zero**.

#### Resposta 200 (exemplo - criar/editar)
```json
{
  "success": true,
  "message": "Promoção definida com sucesso! Preço: R$ 99.90 → R$ 79.90",
  "data": {
    "id": 10,
    "nome": "Produto Exemplo",
    "preco": 99.9,
    "emPromocao": true,
    "precoPromocional": 79.9
  }
}
```

#### Erros possíveis
- 400 – validação de dados (preço inválido, campos faltando etc.)
- 401 – token inválido/ausente
- 403 – usuário não é `admin` nem `vendedor`
- 404 – produto não encontrado

---

### 3. Remover / Deletar Promoção de um Produto

> **Importante:** não existe um endpoint `DELETE /promocao`. 
>
> A remoção da promoção é feita pelo **mesmo endpoint** de atualização, enviando `emPromocao = false`.

```http
PUT /api/produtos/{id}/promocao
```

#### Body (exemplo - remover promoção)
```json
{
  "emPromocao": false
}
```

- Quando `emPromocao = false`, o backend:
  - Seta `emPromocao = false`
  - Seta `precoPromocional = null`

#### Resposta 200 (exemplo)
```json
{
  "success": true,
  "message": "Promoção removida com sucesso",
  "data": {
    "id": 10,
    "nome": "Produto Exemplo",
    "preco": 99.9,
    "emPromocao": false,
    "precoPromocional": null
  }
}
```

---

## 🎨 Orientações para o Frontend (Painel Admin)

### Fluxo sugerido na tela de promoções

1. **Listagem inicial**
   - Chamar `GET /api/produtos/promocoes/lista` para montar a grade/lista de produtos em promoção.

2. **Editar promoção**
   - Ao clicar em "Editar promoção" de um item:
     - Abrir modal/form com campos:
       - `precoNormal` (somente leitura, vindo do backend)
       - `precoPromocional` (editável)
     - Ao salvar, enviar:
```json
{
  "emPromocao": true,
  "precoPromocional": 79.9
}
```
     - Endpoint: `PUT /api/produtos/{id}/promocao` com Bearer Token.

3. **Remover (deletar) promoção**
   - Ao clicar em "Remover promoção" (ou "Encerrar promoção"):
     - Confirmar a ação com o usuário.
     - Enviar:
```json
{
  "emPromocao": false
}
```
     - Endpoint: `PUT /api/produtos/{id}/promocao` com Bearer Token.

4. **Atualizar lista**
   - Após sucesso na edição ou remoção, recarregar:
     - a lista de promoções (`GET /api/produtos/promocoes/lista`), ou
     - atualizar apenas o item alterado em memória.

---

## 🧩 Exemplo de Integração (pseudo-código)

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

async function atualizarPromocaoProduto({ idProduto, emPromocao, precoPromocional }) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/produtos/${idProduto}/promocao`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ emPromocao, precoPromocional }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao atualizar promoção');
  }

  return data;
}

// Exemplo - editar promoção
await atualizarPromocaoProduto({
  idProduto: 10,
  emPromocao: true,
  precoPromocional: 79.9,
});

// Exemplo - remover promoção
await atualizarPromocaoProduto({
  idProduto: 10,
  emPromocao: false,
});
```

---

## ✅ Resumo para o Frontend

- **Editar promoção**: `PUT /api/produtos/{id}/promocao` com `{ emPromocao: true, precoPromocional }`.
- **Remover (deletar) promoção**: `PUT /api/produtos/{id}/promocao` com `{ emPromocao: false }`.
- **Permissão**: apenas **admin** e **vendedor** (JWT obrigatório).
- **Listar promoções**: `GET /api/produtos/promocoes/lista`.

Este arquivo pode ser enviado diretamente para o time de frontend para guiar a implementação da tela de gerenciamento de promoções no painel admin.
