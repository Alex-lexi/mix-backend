#!/usr/bin/env pwsh

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🔐 TESTES DE AUTENTICAÇÃO JWT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 3

# 1️⃣ REGISTRAR VENDEDOR
Write-Host "1️⃣ REGISTRANDO VENDEDOR..." -ForegroundColor Yellow
$vendedorData = @{
    email = "vendedor@example.com"
    senha = "senha123456"
    nome = "João Vendedor"
    tipo = "vendedor"
    telefone = "11987654321"
} | ConvertTo-Json

$vendedorResult = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $vendedorData `
  -ErrorAction SilentlyContinue

if ($vendedorResult) {
  Write-Host "✅ Vendedor registrado com sucesso!" -ForegroundColor Green
  Write-Host "   Email: $($vendedorResult.usuario.email)"
  Write-Host "   Tipo: $($vendedorResult.usuario.tipo)"
  Write-Host "   Token: $($vendedorResult.token.Substring(0, 20))..."
  $vendedorToken = $vendedorResult.token
  Write-Host ""
}

# 2️⃣ REGISTRAR CLIENTE
Write-Host "2️⃣ REGISTRANDO CLIENTE..." -ForegroundColor Yellow
$clienteData = @{
    email = "cliente@example.com"
    senha = "senha123456"
    nome = "Maria Cliente"
    tipo = "cliente"
    telefone = "11912345678"
} | ConvertTo-Json

$clienteResult = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $clienteData `
  -ErrorAction SilentlyContinue

if ($clienteResult) {
  Write-Host "✅ Cliente registrado com sucesso!" -ForegroundColor Green
  Write-Host "   Email: $($clienteResult.usuario.email)"
  Write-Host "   Tipo: $($clienteResult.usuario.tipo)"
  Write-Host "   Token: $($clienteResult.token.Substring(0, 20))..."
  $clienteToken = $clienteResult.token
  Write-Host ""
}

# 3️⃣ LOGIN VENDEDOR
Write-Host "3️⃣ LOGIN DO VENDEDOR..." -ForegroundColor Yellow
$loginVendedorData = @{
    email = "vendedor@example.com"
    senha = "senha123456"
} | ConvertTo-Json

$loginVendedor = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginVendedorData `
  -ErrorAction SilentlyContinue

if ($loginVendedor) {
  Write-Host "✅ Login do vendedor bem-sucedido!" -ForegroundColor Green
  Write-Host "   Email: $($loginVendedor.usuario.email)"
  Write-Host "   Token: $($loginVendedor.token.Substring(0, 20))..."
  $vendedorToken = $loginVendedor.token
  Write-Host ""
}

# 4️⃣ TENTAR CRIAR PRODUTO SEM TOKEN (DEVE FALHAR)
Write-Host "4️⃣ TENTANDO CRIAR PRODUTO SEM TOKEN..." -ForegroundColor Yellow
$produtoSemTokenData = @{
    nome = "Produto Teste"
    preco = 100
    descricao = "Descrição teste"
    imagem = "https://via.placeholder.com/300x300"
    quantidade = 10
    categoriaId = 3
} | ConvertTo-Json

try {
  $produtoSemToken = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos" `
    -Method POST `
    -ContentType "application/json" `
    -Body $produtoSemTokenData `
    -ErrorAction SilentlyContinue
  
  if ($produtoSemToken.success -eq $false) {
    Write-Host "❌ Acesso negado (esperado): $($produtoSemToken.message)" -ForegroundColor Yellow
  }
} catch {
  Write-Host "❌ Acesso negado (esperado)" -ForegroundColor Yellow
}
Write-Host ""

# 5️⃣ CRIAR PRODUTO COM TOKEN DE VENDEDOR (DEVE SUCEDER)
Write-Host "5️⃣ CRIANDO PRODUTO COM TOKEN DE VENDEDOR..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $vendedorToken"
    "Content-Type" = "application/json"
}

$produtoData = @{
    nome = "Camiseta Vendedor"
    preco = 120
    descricao = "Camiseta criada por vendedor"
    imagem = "https://via.placeholder.com/300x300?text=Camiseta+Vendedor"
    quantidade = 30
    cor = "Azul"
    tamanho = "M"
    categoriaId = 3
} | ConvertTo-Json

$produtoVendedor = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos" `
  -Method POST `
  -Headers $headers `
  -Body $produtoData `
  -ErrorAction SilentlyContinue

if ($produtoVendedor.success) {
  Write-Host "✅ Produto criado com sucesso!" -ForegroundColor Green
  Write-Host "   ID: $($produtoVendedor.data.id)"
  Write-Host "   Nome: $($produtoVendedor.data.nome)"
  Write-Host ""
}

# 6️⃣ OBTER PERFIL DO VENDEDOR
Write-Host "6️⃣ OBTENDO PERFIL DO VENDEDOR..." -ForegroundColor Yellow
$perfil = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/perfil" `
  -Method GET `
  -Headers $headers `
  -ErrorAction SilentlyContinue

if ($perfil.success) {
  Write-Host "✅ Perfil obtido com sucesso!" -ForegroundColor Green
  Write-Host "   Nome: $($perfil.data.nome)"
  Write-Host "   Email: $($perfil.data.email)"
  Write-Host "   Tipo: $($perfil.data.tipo)"
  Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ TESTES CONCLUÍDOS!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 ENDPOINTS DE AUTENTICAÇÃO:" -ForegroundColor Green
Write-Host ""
Write-Host "POST /api/auth/register" -ForegroundColor Cyan
Write-Host "  Body: { email, senha, nome, tipo, telefone? }"
Write-Host ""
Write-Host "POST /api/auth/login" -ForegroundColor Cyan
Write-Host "  Body: { email, senha }"
Write-Host ""
Write-Host "GET /api/auth/perfil" -ForegroundColor Cyan
Write-Host "  Header: Authorization: Bearer <token>"
Write-Host ""
Write-Host "PUT /api/auth/perfil" -ForegroundColor Cyan
Write-Host "  Header: Authorization: Bearer <token>"
Write-Host "  Body: { nome?, telefone? }"
Write-Host ""
Write-Host "📌 ENDPOINTS PROTEGIDOS (APENAS VENDEDOR):" -ForegroundColor Green
Write-Host "  POST   /api/produtos (criar)"
Write-Host "  PUT    /api/produtos/:id (editar)"
Write-Host "  DELETE /api/produtos/:id (deletar)"
Write-Host "  POST   /api/categorias (criar)"
Write-Host "  PUT    /api/categorias/:id (editar)"
Write-Host "  DELETE /api/categorias/:id (deletar)"
Write-Host "  GET    /api/pedidos (listar todos)"
Write-Host "  GET    /api/pedidos/status/:status (por status)"
Write-Host "  PUT    /api/pedidos/:id/status (atualizar status)"
Write-Host "  DELETE /api/pedidos/:id (cancelar)"
Write-Host ""
