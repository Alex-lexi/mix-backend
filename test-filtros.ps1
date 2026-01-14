#!/usr/bin/env pwsh

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🔍 TESTES DE FILTROS AVANÇADOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Aguardar servidor iniciar
Start-Sleep -Seconds 2

Write-Host "📌 TESTE 1: Filtrar por faixa de preço (R$ 50 a R$ 500)" -ForegroundColor Yellow
$r1 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/filtrar/avancado/search?precoMin=50&precoMax=500" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r1.total) produtos"
Write-Host ""

Write-Host "📌 TESTE 2: Filtrar por categoria (ID: 1)" -ForegroundColor Yellow
$r2 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/filtrar/avancado/search?categoriaId=1" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r2.total) produtos"
Write-Host ""

Write-Host "📌 TESTE 3: Filtrar por cor (exemplo: 'Preto')" -ForegroundColor Yellow
$r3 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/filtrar/avancado/search?cor=preto" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r3.total) produtos"
Write-Host ""

Write-Host "📌 TESTE 4: Filtrar por tamanho (exemplo: 'M')" -ForegroundColor Yellow
$r4 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/filtrar/avancado/search?tamanho=M" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r4.total) produtos"
Write-Host ""

Write-Host "📌 TESTE 5: Busca geral por termo (exemplo: 'camiseta')" -ForegroundColor Yellow
$r5 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/buscar/global/search?q=camiseta" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r5.totalResultados) resultados"
if ($r5.resultados) {
  Write-Host "  • Categorias: $($r5.resultados.categorias.total)"
  Write-Host "  • Produtos: $($r5.resultados.produtos.total)"
}
Write-Host ""

Write-Host "📌 TESTE 6: Combinar filtros (preço + categoria)" -ForegroundColor Yellow
$r6 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/filtrar/avancado/search?precoMin=0&precoMax=1000&categoriaId=1" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r6.total) produtos"
Write-Host ""

Write-Host "📌 TESTE 7: Combinar filtros (preço + cor + tamanho)" -ForegroundColor Yellow
$r7 = Invoke-RestMethod -Uri "http://localhost:3000/api/produtos/filtrar/avancado/search?precoMin=50&precoMax=500&cor=preto&tamanho=M" -Method GET -ErrorAction SilentlyContinue
Write-Host "Total encontrado: $($r7.total) produtos"
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ Testes Concluídos!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Endpoints Disponíveis:" -ForegroundColor Green
Write-Host "  • GET /api/produtos/filtrar/avancado/search" -ForegroundColor Green
Write-Host "    └─ Query params: precoMin, precoMax, categoriaId, cor, tamanho, busca"
Write-Host ""
Write-Host "  • GET /api/produtos/buscar/global/search" -ForegroundColor Green
Write-Host "    └─ Query params: q (termo de busca)"
Write-Host ""
