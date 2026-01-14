# 🧪 Exemplos de Testes cURL - Mix Backend

## 🔐 AUTENTICAÇÃO

### 1. Registrar Vendedor
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendedor@example.com",
    "senha": "senha123456",
    "nome": "João Vendedor",
    "tipo": "vendedor",
    "telefone": "11987654321"
  }'
```

### 2. Registrar Cliente
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@example.com",
    "senha": "senha123456",
    "nome": "Maria Cliente",
    "tipo": "cliente",
    "telefone": "11912345678"
  }'
```

### 3. Login (Pegar Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendedor@example.com",
    "senha": "senha123456"
  }'
```

**Resposta (salve o token):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": { ... }
}
```

### 4. Obter Perfil (usando token)
```bash
curl -X GET http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 5. Atualizar Perfil
```bash
curl -X PUT http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva Atualizado",
    "telefone": "11999999999"
  }'
```

---

## 📦 PRODUTOS

### 1. Listar Todos os Produtos
```bash
curl -X GET http://localhost:3000/api/produtos
```

### 2. Obter Produto por ID
```bash
curl -X GET http://localhost:3000/api/produtos/1
```

### 3. Buscar por Nome
```bash
curl -X GET "http://localhost:3000/api/produtos/busca/search?nome=camiseta"
```

### 4. Busca Global
```bash
curl -X GET "http://localhost:3000/api/produtos/buscar/global/search?q=azul"
```

### 5. Filtros Avançados
```bash
curl -X GET "http://localhost:3000/api/produtos/filtrar/avancado/search?precoMin=50&precoMax=200&cor=azul&tamanho=M"
```

### 6. Produtos por Categoria
```bash
curl -X GET http://localhost:3000/api/produtos/categoria/3
```

### 7. Produtos Similares
```bash
curl -X GET http://localhost:3000/api/produtos/similares/1
```

### 8. Bestsellers
```bash
curl -X GET http://localhost:3000/api/produtos/bestsellers/lista
```

### 9. Criar Produto (Vendedor)
```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Camiseta Premium",
    "preco": 149.90,
    "descricao": "Camiseta de alta qualidade",
    "imagem": "https://via.placeholder.com/300x300",
    "quantidade": 50,
    "cor": "Preto",
    "tamanho": "M",
    "categoriaId": 3
  }'
```

### 10. Atualizar Produto (Vendedor)
```bash
curl -X PUT http://localhost:3000/api/produtos/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Camiseta Premium Atualizada",
    "preco": 129.90,
    "quantidade": 40
  }'
```

### 11. Deletar Produto (Vendedor)
```bash
curl -X DELETE http://localhost:3000/api/produtos/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🛒 CARRINHO

### 1. Obter Carrinho
```bash
curl -X GET http://localhost:3000/api/carrinho/cliente-xyz-123
```

### 2. Adicionar Item ao Carrinho
```bash
curl -X POST http://localhost:3000/api/carrinho/cliente-xyz-123/adicionar \
  -H "Content-Type: application/json" \
  -d '{
    "produtoId": 1,
    "quantidade": 2
  }'
```

### 3. Atualizar Quantidade do Item
```bash
curl -X PUT http://localhost:3000/api/carrinho/cliente-xyz-123/atualizar/1 \
  -H "Content-Type: application/json" \
  -d '{
    "quantidade": 5
  }'
```

### 4. Remover Item do Carrinho
```bash
curl -X DELETE http://localhost:3000/api/carrinho/cliente-xyz-123/remover/1
```

### 5. Limpar Carrinho
```bash
curl -X DELETE http://localhost:3000/api/carrinho/cliente-xyz-123/limpar
```

---

## 📋 PEDIDOS

### 1. Criar Pedido (a partir do carrinho)
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": "cliente-xyz-123"
  }'
```

### 2. Listar Pedidos (Vendedor)
```bash
curl -X GET http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Obter Pedido por ID
```bash
curl -X GET http://localhost:3000/api/pedidos/1
```

### 4. Obter Pedido por Número
```bash
curl -X GET http://localhost:3000/api/pedidos/numero/PED-001
```

### 5. Listar por Status (Vendedor)
```bash
curl -X GET http://localhost:3000/api/pedidos/status/pendente \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

Estatuses disponíveis: `pendente`, `processando`, `enviado`, `entregue`, `cancelado`

### 6. Atualizar Status do Pedido (Vendedor)
```bash
curl -X PUT http://localhost:3000/api/pedidos/1/status \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "enviado"
  }'
```

### 7. Cancelar Pedido (Vendedor)
```bash
curl -X DELETE http://localhost:3000/api/pedidos/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🏷️ CATEGORIAS

### 1. Listar Categorias
```bash
curl -X GET http://localhost:3000/api/categorias
```

### 2. Obter Categoria
```bash
curl -X GET http://localhost:3000/api/categorias/1
```

### 3. Criar Categoria (Vendedor)
```bash
curl -X POST http://localhost:3000/api/categorias \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Eletrônicos",
    "descricao": "Produtos eletrônicos em geral"
  }'
```

### 4. Atualizar Categoria (Vendedor)
```bash
curl -X PUT http://localhost:3000/api/categorias/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Eletrônicos Premium",
    "descricao": "Produtos eletrônicos de alta qualidade"
  }'
```

### 5. Deletar Categoria (Vendedor)
```bash
curl -X DELETE http://localhost:3000/api/categorias/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📌 DICAS IMPORTANTES

### Salvando Token em Variável (Windows PowerShell)
```powershell
$response = curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -Body '{"email":"vendedor@example.com","senha":"senha123456"}' | ConvertFrom-Json

$token = $response.token
echo $token
```

### Usando o Token Salvo
```powershell
curl -X GET http://localhost:3000/api/auth/perfil `
  -H "Authorization: Bearer $token"
```

### Salvando Token em Variável (Bash/Linux/Mac)
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendedor@example.com","senha":"senha123456"}' \
  | jq -r '.token')

echo $TOKEN
```

### Usando o Token Salvo
```bash
curl -X GET http://localhost:3000/api/auth/perfil \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ CÓDIGOS DE ERRO

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token não fornecido/inválido |
| 403 | Forbidden - Sem permissão (ex: cliente tentando criar produto) |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Email já cadastrado |
| 500 | Internal Server Error - Erro no servidor |

---

## 🔗 Documentação Interativa

Acesse o Swagger UI em: **http://localhost:3000/api-docs**

Lá você pode testar todos os endpoints de forma interativa!
