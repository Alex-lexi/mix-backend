# Script de teste para os novos recursos de produtos
# Execute este script após iniciar o servidor

$baseUrl = "http://localhost:3000/api"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TESTES - NOVOS RECURSOS DE PRODUTOS  " -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Função auxiliar para fazer requisições
function Invoke-APITest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    
    Write-Host "📍 $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Endpoint" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
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
# TESTE 1: Produtos Mais Vendidos
# ===========================================
Write-Host "`n🏆 TESTE 1: PRODUTOS MAIS VENDIDOS" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-APITest -Method "GET" -Endpoint "/produtos/mais-vendidos/lista?limit=5" `
    -Description "Buscar os 5 produtos mais vendidos"

# ===========================================
# TESTE 2: Produtos Novidades
# ===========================================
Write-Host "`n✨ TESTE 2: PRODUTOS NOVIDADES" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-APITest -Method "GET" -Endpoint "/produtos/novidades/lista?limit=10&dias=30" `
    -Description "Buscar novidades dos últimos 30 dias"

Invoke-APITest -Method "GET" -Endpoint "/produtos/novidades/lista?limit=5&dias=7" `
    -Description "Buscar novidades dos últimos 7 dias"

# ===========================================
# TESTE 3: Produtos em Promoção (antes de criar)
# ===========================================
Write-Host "`n🏷️  TESTE 3: PRODUTOS EM PROMOÇÃO (inicial)" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Invoke-APITest -Method "GET" -Endpoint "/produtos/promocoes/lista" `
    -Description "Buscar produtos em promoção"

# ===========================================
# TESTE 4: Criar Produto com Promoção
# ===========================================
Write-Host "`n➕ TESTE 4: CRIAR PRODUTO COM PROMOÇÃO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

Write-Host "⚠️  Primeiro, faça login como vendedor para obter o token:" -ForegroundColor Yellow
Write-Host "   POST $baseUrl/auth/login" -ForegroundColor Gray
Write-Host "   Body: { `"email`": `"vendedor@teste.com`", `"senha`": `"senha123`" }`n" -ForegroundColor Gray

$email = Read-Host "Digite o email do vendedor (ou pressione Enter para pular)"

if ($email) {
    $senha = Read-Host "Digite a senha" -AsSecureString
    $senhaPlainText = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($senha))
    
    try {
        $loginBody = @{
            email = $email
            senha = $senhaPlainText
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
            -Headers @{"Content-Type"="application/json"} -Body $loginBody
        
        $token = $loginResponse.token
        Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
        Write-Host "Token: $($token.Substring(0, 20))...`n" -ForegroundColor Gray
        
        # Criar produto com promoção
        $novoProduto = @{
            nome = "Produto Teste Promoção"
            preco = 199.90
            descricao = "Produto de teste criado com promoção"
            imagem = "https://via.placeholder.com/300"
            quantidade = 50
            categoriaId = 1
            emPromocao = $true
            precoPromocional = 149.90
        }
        
        Invoke-APITest -Method "POST" -Endpoint "/produtos" `
            -Description "Criar produto já com promoção" `
            -Body $novoProduto -Token $token
        
        # ===========================================
        # TESTE 5: Definir Promoção em Produto Existente
        # ===========================================
        Write-Host "`n🏷️  TESTE 5: DEFINIR PROMOÇÃO EM PRODUTO EXISTENTE" -ForegroundColor Magenta
        Write-Host "=" * 50 -ForegroundColor Magenta
        
        $produtoId = Read-Host "Digite o ID de um produto existente para colocar em promoção"
        
        if ($produtoId) {
            # Buscar produto primeiro
            Invoke-APITest -Method "GET" -Endpoint "/produtos/$produtoId" `
                -Description "Buscar detalhes do produto"
            
            # Ativar promoção
            $promocao = @{
                emPromocao = $true
                precoPromocional = 79.90
            }
            
            Invoke-APITest -Method "PUT" -Endpoint "/produtos/$produtoId/promocao" `
                -Description "Ativar promoção no produto" `
                -Body $promocao -Token $token
            
            # Verificar produtos em promoção novamente
            Invoke-APITest -Method "GET" -Endpoint "/produtos/promocoes/lista" `
                -Description "Verificar produtos em promoção após adicionar"
            
            # Remover promoção
            $removerPromocao = @{
                emPromocao = $false
            }
            
            Invoke-APITest -Method "PUT" -Endpoint "/produtos/$produtoId/promocao" `
                -Description "Remover promoção do produto" `
                -Body $removerPromocao -Token $token
        }
        
    } catch {
        Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $_.ErrorDetails.Message | Write-Host -ForegroundColor Red
        }
    }
} else {
    Write-Host "⏭️  Testes de promoção (autenticados) pulados.`n" -ForegroundColor Yellow
}

# ===========================================
# TESTE 6: Validações de Promoção
# ===========================================
Write-Host "`n🔍 TESTE 6: VALIDAÇÕES DE PROMOÇÃO" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Magenta

if ($token) {
    $produtoId = Read-Host "Digite o ID de um produto para testar validações (ou Enter para pular)"
    
    if ($produtoId) {
        # Teste 1: Promoção sem preço promocional
        Write-Host "`n❌ Teste: Promoção sem preço promocional (deve falhar)" -ForegroundColor Yellow
        $invalidBody1 = @{
            emPromocao = $true
        }
        Invoke-APITest -Method "PUT" -Endpoint "/produtos/$produtoId/promocao" `
            -Description "Tentar ativar promoção sem preço" `
            -Body $invalidBody1 -Token $token
        
        # Teste 2: Preço promocional maior que o normal
        Write-Host "`n❌ Teste: Preço promocional maior que o normal (deve falhar)" -ForegroundColor Yellow
        $invalidBody2 = @{
            emPromocao = $true
            precoPromocional = 99999.90
        }
        Invoke-APITest -Method "PUT" -Endpoint "/produtos/$produtoId/promocao" `
            -Description "Tentar definir preço promocional maior que o normal" `
            -Body $invalidBody2 -Token $token
    }
}

# ===========================================
# RESUMO
# ===========================================
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "  TESTES CONCLUÍDOS  " -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan

Write-Host "`n📋 Endpoints testados:" -ForegroundColor Green
Write-Host "   ✅ GET  /api/produtos/mais-vendidos/lista" -ForegroundColor White
Write-Host "   ✅ GET  /api/produtos/novidades/lista" -ForegroundColor White
Write-Host "   ✅ GET  /api/produtos/promocoes/lista" -ForegroundColor White
Write-Host "   ✅ POST /api/produtos (com promoção)" -ForegroundColor White
Write-Host "   ✅ PUT  /api/produtos/:id/promocao" -ForegroundColor White

Write-Host "`n📚 Para mais informações, consulte: PRODUTOS_NOVOS_RECURSOS.md`n" -ForegroundColor Cyan
