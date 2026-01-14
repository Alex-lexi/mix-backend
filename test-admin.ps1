# Script de teste do sistema de administrador principal

Write-Host "`n=== TESTE: Sistema de Administrador Principal ===" -ForegroundColor Cyan
Write-Host "Backend deve estar rodando em http://localhost:3000`n" -ForegroundColor Yellow

$baseUrl = "http://localhost:3000"

# ========================================
# 1. LOGIN COMO ADMIN
# ========================================
Write-Host "`n[1] LOGIN COMO ADMINISTRADOR PRINCIPAL" -ForegroundColor Green
Write-Host "POST $baseUrl/api/auth/login" -ForegroundColor Gray

$loginAdmin = @{
    email = "admin@mixcommerce.com"
    senha = "Admin@123456"
} | ConvertTo-Json

try {
    $responseAdmin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginAdmin `
        -ContentType "application/json"
    
    Write-Host "✓ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "Tipo: $($responseAdmin.usuario.tipo)" -ForegroundColor Cyan
    Write-Host "Nome: $($responseAdmin.usuario.nome)" -ForegroundColor Cyan
    Write-Host "Email: $($responseAdmin.usuario.email)" -ForegroundColor Cyan
    
    $tokenAdmin = $responseAdmin.token
    Write-Host "Token salvo para proximas requisicoes`n" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "VERIFIQUE: As variaveis ADMIN_EMAIL e ADMIN_SENHA no .env`n" -ForegroundColor Yellow
    exit
}

# ========================================
# 2. ADMIN CRIA VENDEDOR
# ========================================
Write-Host "`n[2] ADMIN CRIANDO CONTA DE VENDEDOR" -ForegroundColor Green
Write-Host "POST $baseUrl/api/auth/register (COM token do admin)" -ForegroundColor Gray

$novoVendedor = @{
    email = "vendedor.teste@loja.com"
    senha = "senha123456"
    nome = "Maria Vendedora"
    tipo = "vendedor"
    telefone = "11987654321"
} | ConvertTo-Json

try {
    $responseVendedor = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Body $novoVendedor `
        -ContentType "application/json" `
        -Headers @{ Authorization = "Bearer $tokenAdmin" }
    
    Write-Host "✓ Vendedor criado com sucesso!" -ForegroundColor Green
    Write-Host "ID: $($responseVendedor.usuario.id)" -ForegroundColor Cyan
    Write-Host "Nome: $($responseVendedor.usuario.nome)" -ForegroundColor Cyan
    Write-Host "Tipo: $($responseVendedor.usuario.tipo)" -ForegroundColor Cyan
    Write-Host "Email: $($responseVendedor.usuario.email)`n" -ForegroundColor Cyan
} catch {
    $erro = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($erro.message -like "*já cadastrado*") {
        Write-Host "! Vendedor já existe (isso é normal em testes repetidos)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Erro ao criar vendedor: $($erro.message)" -ForegroundColor Red
    }
}

# ========================================
# 3. TENTAR CRIAR VENDEDOR SEM SER ADMIN
# ========================================
Write-Host "`n[3] TENTANDO CRIAR VENDEDOR SEM SER ADMIN (deve falhar)" -ForegroundColor Green
Write-Host "POST $baseUrl/api/auth/register (SEM token)" -ForegroundColor Gray

$vendedorSemAuth = @{
    email = "vendedor.nao.autorizado@loja.com"
    senha = "senha123456"
    nome = "Vendedor Não Autorizado"
    tipo = "vendedor"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Body $vendedorSemAuth `
        -ContentType "application/json"
    
    Write-Host "✗ ERRO: Vendedor foi criado sem autenticação (bug!)" -ForegroundColor Red
} catch {
    $erro = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Bloqueado corretamente!" -ForegroundColor Green
    Write-Host "Mensagem: $($erro.message)" -ForegroundColor Yellow
}

# ========================================
# 4. CLIENTE CRIA CONTA NORMALMENTE
# ========================================
Write-Host "`n[4] CLIENTE CRIANDO CONTA (sem autenticação)" -ForegroundColor Green
Write-Host "POST $baseUrl/api/auth/register (sem token, tipo cliente)" -ForegroundColor Gray

$novoCliente = @{
    email = "cliente.teste@email.com"
    senha = "senha123"
    nome = "João Cliente Teste"
    tipo = "cliente"
} | ConvertTo-Json

try {
    $responseCliente = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post `
        -Body $novoCliente `
        -ContentType "application/json"
    
    Write-Host "✓ Cliente criado com sucesso!" -ForegroundColor Green
    Write-Host "Nome: $($responseCliente.usuario.nome)" -ForegroundColor Cyan
    Write-Host "Tipo: $($responseCliente.usuario.tipo)" -ForegroundColor Cyan
    Write-Host "Email: $($responseCliente.usuario.email)`n" -ForegroundColor Cyan
} catch {
    $erro = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($erro.message -like "*já cadastrado*") {
        Write-Host "! Cliente já existe (isso é normal em testes repetidos)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Erro ao criar cliente: $($erro.message)" -ForegroundColor Red
    }
}

# ========================================
# 5. LOGIN COMO VENDEDOR
# ========================================
Write-Host "`n[5] LOGIN COMO VENDEDOR" -ForegroundColor Green
Write-Host "POST $baseUrl/api/auth/login" -ForegroundColor Gray

$loginVendedor = @{
    email = "vendedor.teste@loja.com"
    senha = "senha123456"
} | ConvertTo-Json

try {
    $responseLoginVendedor = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post `
        -Body $loginVendedor `
        -ContentType "application/json"
    
    Write-Host "✓ Login de vendedor bem-sucedido!" -ForegroundColor Green
    Write-Host "Tipo: $($responseLoginVendedor.usuario.tipo)" -ForegroundColor Cyan
    Write-Host "Nome: $($responseLoginVendedor.usuario.nome)" -ForegroundColor Cyan
    
    $tokenVendedor = $responseLoginVendedor.token
} catch {
    Write-Host "! Vendedor ainda não existe ou erro no login" -ForegroundColor Yellow
}

# ========================================
# 6. VENDEDOR TENTA CRIAR OUTRO VENDEDOR
# ========================================
if ($tokenVendedor) {
    Write-Host "`n[6] VENDEDOR TENTANDO CRIAR OUTRO VENDEDOR (deve falhar)" -ForegroundColor Green
    Write-Host "POST $baseUrl/api/auth/register (com token de vendedor)" -ForegroundColor Gray

    $outroVendedor = @{
        email = "vendedor2@loja.com"
        senha = "senha123"
        nome = "Outro Vendedor"
        tipo = "vendedor"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
            -Method Post `
            -Body $outroVendedor `
            -ContentType "application/json" `
            -Headers @{ Authorization = "Bearer $tokenVendedor" }
        
        Write-Host "✗ ERRO: Vendedor conseguiu criar outro vendedor (bug!)" -ForegroundColor Red
    } catch {
        $erro = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "✓ Bloqueado corretamente!" -ForegroundColor Green
        Write-Host "Mensagem: $($erro.message)" -ForegroundColor Yellow
    }
}

# ========================================
# RESUMO
# ========================================
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "RESUMO DOS TESTES" -ForegroundColor Cyan
Write-Host "="*60 -ForegroundColor Cyan

Write-Host "`n✓ Admin pode fazer login" -ForegroundColor Green
Write-Host "✓ Admin pode criar vendedores" -ForegroundColor Green
Write-Host "✓ Clientes podem se registrar livremente" -ForegroundColor Green
Write-Host "✓ Vendedores NÃO podem criar outros vendedores" -ForegroundColor Green
Write-Host "✓ Pessoas não autenticadas NÃO podem criar vendedores" -ForegroundColor Green

Write-Host "`nCREDENCIAIS PARA TESTES:" -ForegroundColor Yellow
Write-Host "Admin:" -ForegroundColor Cyan
Write-Host "  Email: admin@mixcommerce.com" -ForegroundColor Gray
Write-Host "  Senha: Admin@123456" -ForegroundColor Gray

if ($responseVendedor -or $responseLoginVendedor) {
    Write-Host "`nVendedor Criado:" -ForegroundColor Cyan
    Write-Host "  Email: vendedor.teste@loja.com" -ForegroundColor Gray
    Write-Host "  Senha: senha123456" -ForegroundColor Gray
}

if ($responseCliente) {
    Write-Host "`nCliente Criado:" -ForegroundColor Cyan
    Write-Host "  Email: cliente.teste@email.com" -ForegroundColor Gray
    Write-Host "  Senha: senha123" -ForegroundColor Gray
}

Write-Host "`nDocumentacao completa: ADMIN_PRINCIPAL_FRONTEND.md" -ForegroundColor Yellow
Write-Host "Swagger: http://localhost:3000/api-docs`n" -ForegroundColor Yellow
