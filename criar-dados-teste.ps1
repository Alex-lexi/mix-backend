#!/usr/bin/env pwsh

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  📝 CRIAR DADOS PARA TESTAR FILTROS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# 1️⃣ CRIAR CATEGORIA
Write-Host "1️⃣ Criando Categoria..." -ForegroundColor Yellow
$categData = @{
    nome = "Camisetas"
} | ConvertTo-Json

$categResult = Invoke-RestMethod -Uri "http://localhost:3000/api/categorias" `
  -Method POST `
  -ContentType "application/json" `
  -Body $categData `
  -ErrorAction SilentlyContinue

if ($categResult) {
  Write-Host "✅ Categoria criada com sucesso!" -ForegroundColor Green
  $categId = $categResult.data.id
  Write-Host "   ID: $categId"
  Write-Host "   Nome: $($categResult.data.nome)"
  Write-Host ""
}

# 2️⃣ CRIAR PRODUTO 1
Write-Host "2️⃣ Criando Produto 1 (Camiseta Preta)..." -ForegroundColor Yellow
$prod1Data = @{
    nome = "Camiseta Básica Preta"
    preco = 99.90
    descricao = "Camiseta de algodão 100% confortável e durável"
    imagem = "https://via.placeholder.com/300x300?text=Camiseta+Preta"
    quantidade = 50
    cor = "Preto"
    tamanho = "M"
    categoriaId = $categId
} | ConvertTo-Json

$prod1Result = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos" `
  -Method POST `
  -ContentType "application/json" `
  -Body $prod1Data `
  -ErrorAction SilentlyContinue

if ($prod1Result) {
  Write-Host "✅ Produto 1 criado com sucesso!" -ForegroundColor Green
  Write-Host "   ID: $($prod1Result.data.id)"
  Write-Host "   Nome: $($prod1Result.data.nome)"
  Write-Host "   Preço: R$ $($prod1Result.data.preco)"
  Write-Host "   Cor: $($prod1Result.data.cor)"
  Write-Host "   Tamanho: $($prod1Result.data.tamanho)"
  Write-Host ""
}

# 3️⃣ CRIAR PRODUTO 2
Write-Host "3️⃣ Criando Produto 2 (Camiseta Branca)..." -ForegroundColor Yellow
$prod2Data = @{
    nome = "Camiseta Básica Branca"
    preco = 89.90
    descricao = "Camiseta branca lisa muito confortável para o dia a dia"
    imagem = "https://via.placeholder.com/300x300?text=Camiseta+Branca"
    quantidade = 75
    cor = "Branco"
    tamanho = "G"
    categoriaId = $categId
} | ConvertTo-Json

$prod2Result = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos" `
  -Method POST `
  -ContentType "application/json" `
  -Body $prod2Data `
  -ErrorAction SilentlyContinue

if ($prod2Result) {
  Write-Host "✅ Produto 2 criado com sucesso!" -ForegroundColor Green
  Write-Host "   ID: $($prod2Result.data.id)"
  Write-Host "   Nome: $($prod2Result.data.nome)"
  Write-Host "   Preço: R$ $($prod2Result.data.preco)"
  Write-Host "   Cor: $($prod2Result.data.cor)"
  Write-Host "   Tamanho: $($prod2Result.data.tamanho)"
  Write-Host ""
}

# 4️⃣ CRIAR PRODUTO 3
Write-Host "4️⃣ Criando Produto 3 (Camiseta Premium)..." -ForegroundColor Yellow
$prod3Data = @{
    nome = "Camiseta Premium Cinza"
    preco = 149.90
    descricao = "Camiseta premium em cinza escuro com qualidade superior"
    imagem = "https://via.placeholder.com/300x300?text=Camiseta+Cinza"
    quantidade = 30
    cor = "Cinza"
    tamanho = "P"
    categoriaId = $categId
} | ConvertTo-Json

$prod3Result = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos" `
  -Method POST `
  -ContentType "application/json" `
  -Body $prod3Data `
  -ErrorAction SilentlyContinue

if ($prod3Result) {
  Write-Host "✅ Produto 3 criado com sucesso!" -ForegroundColor Green
  Write-Host "   ID: $($prod3Result.data.id)"
  Write-Host "   Nome: $($prod3Result.data.nome)"
  Write-Host "   Preço: R$ $($prod3Result.data.preco)"
  Write-Host "   Cor: $($prod3Result.data.cor)"
  Write-Host "   Tamanho: $($prod3Result.data.tamanho)"
  Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ AGORA TESTE OS FILTROS!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 EXEMPLOS DE FILTROS:" -ForegroundColor Green
Write-Host ""
Write-Host "1️⃣ Filtrar por preço (R$ 50-100):" -ForegroundColor Cyan
Write-Host "   curl -s 'http://localhost:3000/api/produtos/filtrar/avancado/search?precoMin=50&precoMax=100'" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣ Filtrar por cor (Preto):" -ForegroundColor Cyan
Write-Host "   curl -s 'http://localhost:3000/api/produtos/filtrar/avancado/search?cor=Preto'" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣ Filtrar por tamanho (M):" -ForegroundColor Cyan
Write-Host "   curl -s 'http://localhost:3000/api/produtos/filtrar/avancado/search?tamanho=M'" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣ Filtrar por categoria:" -ForegroundColor Cyan
Write-Host "   curl -s 'http://localhost:3000/api/produtos/filtrar/avancado/search?categoriaId=$categId'" -ForegroundColor Yellow
Write-Host ""
Write-Host "5️⃣ Busca global (Camiseta):" -ForegroundColor Cyan
Write-Host "   curl -s 'http://localhost:3000/api/produtos/buscar/global/search?q=Camiseta'" -ForegroundColor Yellow
Write-Host ""
Write-Host "6️⃣ Combinar filtros (preço + cor):" -ForegroundColor Cyan
Write-Host "   curl -s 'http://localhost:3000/api/produtos/filtrar/avancado/search?precoMin=80&precoMax=150&cor=Branco'" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
