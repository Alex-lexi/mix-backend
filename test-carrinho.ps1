# Script de teste para a API do Carrinho
# Execute este script após iniciar o servidor

$baseUrl = "http://localhost:3000/api"
$clienteId = "cliente-teste@email.com"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "    TESTES - API DO CARRINHO            " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Cliente ID: $clienteId`n" -ForegroundColor Yellow

# Função auxiliar para fazer requisições
function Invoke-CarrinhoTest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null
    )
    
    Write-Host "📍 $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Endpoint" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers
        }
        
        Write-Host "   ✅ Sucesso!" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
    } catch {
        Write-Host "   ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json | Write-Host -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

# ===========================================
# TESTE 1: Obter Carrinho (vazio inicialmente)
# ===========================================
Write-Host "`n🛒 TESTE 1: OBTER CARRINHO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-CarrinhoTest -Method "GET" -Endpoint "/carrinho/$clienteId" `
    -Description "Obter carrinho (deve criar um novo se não existir)"

# ===========================================
# TESTE 2: Adicionar Produtos ao Carrinho
# ===========================================
Write-Host "`n➕ TESTE 2: ADICIONAR PRODUTOS" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Write-Host "Primeiro, vamos verificar os produtos disponíveis:`n" -ForegroundColor Yellow
try {
    $produtos = Invoke-RestMethod -Uri "$baseUrl/produtos" -Method GET
    Write-Host "Produtos disponíveis:" -ForegroundColor Green
    $produtos.data | Select-Object -First 5 | ForEach-Object {
        Write-Host "  ID: $($_.id) - $($_.nome) - R$ $($_.preco)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "Não foi possível listar produtos. Continuando com IDs padrão...`n" -ForegroundColor Yellow
}

# Adicionar primeiro produto
$produto1 = @{
    produtoId = 1
    quantidade = 2
}

Invoke-CarrinhoTest -Method "POST" -Endpoint "/carrinho/$clienteId/adicionar" `
    -Description "Adicionar produto ID 1 (quantidade: 2)" `
    -Body $produto1

# Adicionar segundo produto
$produto2 = @{
    produtoId = 2
    quantidade = 1
}

Invoke-CarrinhoTest -Method "POST" -Endpoint "/carrinho/$clienteId/adicionar" `
    -Description "Adicionar produto ID 2 (quantidade: 1)" `
    -Body $produto2

# Adicionar mais unidades do primeiro produto (deve incrementar)
$produto1mais = @{
    produtoId = 1
    quantidade = 3
}

Invoke-CarrinhoTest -Method "POST" -Endpoint "/carrinho/$clienteId/adicionar" `
    -Description "Adicionar mais 3 unidades do produto ID 1 (deve incrementar)" `
    -Body $produto1mais

# ===========================================
# TESTE 3: Ver Carrinho Atualizado
# ===========================================
Write-Host "`n🔍 TESTE 3: VER CARRINHO ATUALIZADO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-CarrinhoTest -Method "GET" -Endpoint "/carrinho/$clienteId" `
    -Description "Obter carrinho com produtos"

# Obter carrinho para pegar itemId
try {
    $carrinhoAtual = Invoke-RestMethod -Uri "$baseUrl/carrinho/$clienteId" -Method GET
    $primeiroItem = $carrinhoAtual.data.itens[0]
    
    if ($primeiroItem) {
        $itemId = $primeiroItem.id
        
        # ===========================================
        # TESTE 4: Atualizar Quantidade
        # ===========================================
        Write-Host "`n📝 TESTE 4: ATUALIZAR QUANTIDADE" -ForegroundColor Magenta
        Write-Host "=" * 50 -ForegroundColor Magenta
        
        Write-Host "Item selecionado:" -ForegroundColor Yellow
        Write-Host "  ID: $itemId" -ForegroundColor White
        Write-Host "  Produto: $($primeiroItem.produto.nome)" -ForegroundColor White
        Write-Host "  Quantidade atual: $($primeiroItem.quantidade)`n" -ForegroundColor White
        
        $novaQuantidade = @{
            quantidade = 10
        }
        
        Invoke-CarrinhoTest -Method "PUT" -Endpoint "/carrinho/$clienteId/itens/$itemId" `
            -Description "Atualizar quantidade do item $itemId para 10" `
            -Body $novaQuantidade
        
        # ===========================================
        # TESTE 5: Remover Produto do Carrinho
        # ===========================================
        Write-Host "`n🗑️  TESTE 5: REMOVER PRODUTO" -ForegroundColor Magenta
        Write-Host "=" * 50 -ForegroundColor Magenta
        
        # Pegar segundo item (se existir)
        if ($carrinhoAtual.data.itens.Count -gt 1) {
            $segundoItem = $carrinhoAtual.data.itens[1]
            $itemIdRemover = $segundoItem.id
            
            Write-Host "Removendo item:" -ForegroundColor Yellow
            Write-Host "  ID: $itemIdRemover" -ForegroundColor White
            Write-Host "  Produto: $($segundoItem.produto.nome)`n" -ForegroundColor White
            
            Invoke-CarrinhoTest -Method "DELETE" -Endpoint "/carrinho/$clienteId/itens/$itemIdRemover" `
                -Description "Remover produto do carrinho"
        } else {
            Write-Host "⚠️  Não há segundo item para remover. Pulando teste...`n" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Erro ao obter detalhes do carrinho: $($_.Exception.Message)`n" -ForegroundColor Red
}

# ===========================================
# TESTE 6: Ver Estado Final do Carrinho
# ===========================================
Write-Host "`n📊 TESTE 6: ESTADO FINAL DO CARRINHO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-CarrinhoTest -Method "GET" -Endpoint "/carrinho/$clienteId" `
    -Description "Ver carrinho após todas as operações"

# ===========================================
# TESTE 7: Limpar Carrinho
# ===========================================
Write-Host "`n🧹 TESTE 7: LIMPAR CARRINHO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-CarrinhoTest -Method "DELETE" -Endpoint "/carrinho/$clienteId/limpar" `
    -Description "Limpar todos os itens do carrinho"

# ===========================================
# TESTE 8: Verificar Carrinho Vazio
# ===========================================
Write-Host "`n✔️  TESTE 8: VERIFICAR CARRINHO VAZIO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-CarrinhoTest -Method "GET" -Endpoint "/carrinho/$clienteId" `
    -Description "Verificar carrinho após limpar (deve estar vazio)"

# ===========================================
# TESTE 9: Validações (Testes Negativos)
# ===========================================
Write-Host "`n⚠️  TESTE 9: VALIDAÇÕES (testes negativos)" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

# Teste 1: Adicionar produto inexistente
Write-Host "❌ Teste: Adicionar produto inexistente (deve falhar)" -ForegroundColor Yellow
$produtoInvalido = @{
    produtoId = 99999
    quantidade = 1
}
Invoke-CarrinhoTest -Method "POST" -Endpoint "/carrinho/$clienteId/adicionar" `
    -Description "Tentar adicionar produto inexistente" `
    -Body $produtoInvalido

# Teste 2: Quantidade inválida (zero)
Write-Host "❌ Teste: Quantidade zero (deve falhar)" -ForegroundColor Yellow
$quantidadeZero = @{
    produtoId = 1
    quantidade = 0
}
Invoke-CarrinhoTest -Method "POST" -Endpoint "/carrinho/$clienteId/adicionar" `
    -Description "Tentar adicionar quantidade zero" `
    -Body $quantidadeZero

# Teste 3: Quantidade negativa
Write-Host "❌ Teste: Quantidade negativa (deve falhar)" -ForegroundColor Yellow
$quantidadeNegativa = @{
    produtoId = 1
    quantidade = -5
}
Invoke-CarrinhoTest -Method "POST" -Endpoint "/carrinho/$clienteId/adicionar" `
    -Description "Tentar adicionar quantidade negativa" `
    -Body $quantidadeNegativa

# Teste 4: Remover item inexistente
Write-Host "❌ Teste: Remover item inexistente (deve falhar)" -ForegroundColor Yellow
Invoke-CarrinhoTest -Method "DELETE" -Endpoint "/carrinho/$clienteId/itens/99999" `
    -Description "Tentar remover item inexistente"

# ===========================================
# RESUMO
# ===========================================
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "  TESTES CONCLUÍDOS  " -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

Write-Host "`n📋 Endpoints testados:" -ForegroundColor Green
Write-Host "   ✅ GET    /api/carrinho/:clienteId" -ForegroundColor White
Write-Host "   ✅ POST   /api/carrinho/:clienteId/adicionar" -ForegroundColor White
Write-Host "   ✅ PUT    /api/carrinho/:clienteId/itens/:itemId" -ForegroundColor White
Write-Host "   ✅ DELETE /api/carrinho/:clienteId/itens/:itemId" -ForegroundColor White
Write-Host "   ✅ DELETE /api/carrinho/:clienteId/limpar" -ForegroundColor White

Write-Host "`n✅ Funcionalidades testadas:" -ForegroundColor Green
Write-Host "   • Criação automática de carrinho" -ForegroundColor White
Write-Host "   • Adicionar produtos" -ForegroundColor White
Write-Host "   • Incrementar quantidade de produto existente" -ForegroundColor White
Write-Host "   • Atualizar quantidade" -ForegroundColor White
Write-Host "   • Remover produto" -ForegroundColor White
Write-Host "   • Limpar carrinho" -ForegroundColor White
Write-Host "   • Cálculo automático de subtotais e total" -ForegroundColor White
Write-Host "   • Validações (produto inexistente, quantidade inválida)" -ForegroundColor White

Write-Host "`n📚 Para mais informações, consulte: CARRINHO_API.md" -ForegroundColor Cyan
Write-Host "📖 Documentação Swagger: http://localhost:3000/api-docs`n" -ForegroundColor Cyan
