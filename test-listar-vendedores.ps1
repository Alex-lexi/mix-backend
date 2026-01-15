# Script de teste para listar vendedores
# Certifique-se de que o servidor está rodando antes de executar este script

Write-Host "=== TESTE: Listar Vendedores ===" -ForegroundColor Cyan
Write-Host ""

# Configuração
$baseUrl = "http://localhost:3000"
$adminEmail = $env:ADMIN_EMAIL
$adminSenha = $env:ADMIN_SENHA

if (-not $adminEmail -or -not $adminSenha) {
    Write-Host "❌ ERRO: Variáveis ADMIN_EMAIL e ADMIN_SENHA não definidas no .env" -ForegroundColor Red
    Write-Host "Configure o arquivo .env com as credenciais do admin" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Configuração:" -ForegroundColor Green
Write-Host "   Base URL: $baseUrl"
Write-Host "   Admin Email: $adminEmail"
Write-Host ""

# 1. Fazer login como admin
Write-Host "1️⃣ Fazendo login como administrador..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $adminEmail
        senha = $adminSenha
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $loginResponse.token
    Write-Host "   ✅ Login realizado com sucesso!" -ForegroundColor Green
    Write-Host "   Token obtido: $($token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ Erro ao fazer login:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Listar vendedores
Write-Host "2️⃣ Listando vendedores cadastrados..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $vendedoresResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/vendedores" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    Write-Host "   ✅ Vendedores listados com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Exibir resultado
    Write-Host "📊 RESULTADO:" -ForegroundColor Cyan
    Write-Host "   Total de vendedores: $($vendedoresResponse.total)" -ForegroundColor White
    Write-Host ""

    if ($vendedoresResponse.total -eq 0) {
        Write-Host "   ⚠️  Nenhum vendedor cadastrado ainda" -ForegroundColor Yellow
        Write-Host "   Use o endpoint POST /api/auth/register para cadastrar vendedores" -ForegroundColor Gray
    } else {
        Write-Host "   📋 Lista de Vendedores:" -ForegroundColor White
        Write-Host ""
        
        foreach ($vendedor in $vendedoresResponse.data) {
            Write-Host "   ════════════════════════════════════════" -ForegroundColor DarkGray
            Write-Host "   ID:       $($vendedor.id)" -ForegroundColor White
            Write-Host "   Nome:     $($vendedor.nome)" -ForegroundColor Cyan
            Write-Host "   Email:    $($vendedor.email)" -ForegroundColor Gray
            
            if ($vendedor.telefone) {
                Write-Host "   Telefone: $($vendedor.telefone)" -ForegroundColor Gray
            }
            
            $dataCadastro = [DateTime]::Parse($vendedor.createdAt).ToString("dd/MM/yyyy HH:mm")
            Write-Host "   Cadastro: $dataCadastro" -ForegroundColor DarkGray
        }
        Write-Host "   ════════════════════════════════════════" -ForegroundColor DarkGray
    }

    Write-Host ""
    
    # Exibir JSON completo
    Write-Host "📄 JSON Completo da Resposta:" -ForegroundColor Cyan
    $vendedoresResponse | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor DarkGray

} catch {
    Write-Host "   ❌ Erro ao listar vendedores:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 403) {
            Write-Host "   ⚠️  Usuário não tem permissão de administrador" -ForegroundColor Yellow
        }
    }
    exit 1
}

Write-Host ""
Write-Host "✅ TESTE CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Consulte o arquivo ADMIN_VENDEDORES.md para documentação completa" -ForegroundColor White
Write-Host "   2. Implemente a listagem de vendedores no frontend" -ForegroundColor White
Write-Host "   3. Use este endpoint para atualizar a lista após cadastrar novos vendedores" -ForegroundColor White
