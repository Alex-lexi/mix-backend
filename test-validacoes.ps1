#!/usr/bin/env pwsh

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🧪 TESTES DE VALIDAÇÃO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Teste 1: Email Inválido
Write-Host "❌ TESTE 1: Email Inválido" -ForegroundColor Yellow
$response1 = curl.exe -s -X POST "http://localhost:3000/api/pedidos/finalizar" `
  -H "Content-Type: application/json" `
  -d '{"clienteId":"cliente123","nomeCliente":"João Silva","emailCliente":"invalid-email","telefonecliente":"11987654321"}'
Write-Host "Resposta:" $response1
Write-Host ""

# Teste 2: Telefone Inválido
Write-Host "❌ TESTE 2: Telefone Inválido (muito curto)" -ForegroundColor Yellow
$response2 = curl.exe -s -X POST "http://localhost:3000/api/pedidos/finalizar" `
  -H "Content-Type: application/json" `
  -d '{"clienteId":"cliente123","nomeCliente":"João Silva","emailCliente":"joao@email.com","telefonecliente":"123"}'
Write-Host "Resposta:" $response2
Write-Host ""

# Teste 3: Preço Negativo
Write-Host "❌ TESTE 3: Preço Negativo" -ForegroundColor Yellow
$response3 = curl.exe -s -X POST "http://localhost:3000/api/produtos" `
  -H "Content-Type: application/json" `
  -d '{"nome":"Produto Teste","preco":-100,"descricao":"Descrição","imagem":"https://example.com/img.jpg","quantidade":10,"categoriaId":1}'
Write-Host "Resposta:" $response3
Write-Host ""

# Teste 4: Quantidade Negativa no Carrinho
Write-Host "❌ TESTE 4: Quantidade Negativa no Carrinho" -ForegroundColor Yellow
$response4 = curl.exe -s -X POST "http://localhost:3000/api/carrinho/cliente123/adicionar" `
  -H "Content-Type: application/json" `
  -d '{"produtoId":1,"quantidade":-5}'
Write-Host "Resposta:" $response4
Write-Host ""

# Teste 5: Dados Válidos
Write-Host "✅ TESTE 5: Criar Pedido com Dados Válidos" -ForegroundColor Green
$response5 = curl.exe -s -X POST "http://localhost:3000/api/pedidos/finalizar" `
  -H "Content-Type: application/json" `
  -d '{"clienteId":"cliente123","nomeCliente":"João Silva Santos","emailCliente":"joao@email.com","telefonecliente":"11987654321"}'
Write-Host "Resposta:" $response5
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✨ Testes Concluídos!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
