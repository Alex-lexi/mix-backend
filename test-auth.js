import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

let vendedorToken = null;
let clienteToken = null;

async function test() {
  log('\n================================================', 'cyan');
  log('  🔐 TESTES DE AUTENTICAÇÃO JWT', 'cyan');
  log('================================================\n', 'cyan');

  try {
    // 1️⃣ REGISTRAR VENDEDOR
    log('1️⃣ REGISTRANDO VENDEDOR...', 'yellow');
    const vendedorReg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendedor@example.com',
        senha: 'senha123456',
        nome: 'João Vendedor',
        tipo: 'vendedor',
        telefone: '11987654321'
      })
    });
    const vendedorData = await vendedorReg.json();
    if (vendedorData.success) {
      vendedorToken = vendedorData.token;
      log(`✅ Vendedor registrado com sucesso!`, 'green');
      log(`   Email: ${vendedorData.usuario.email}`);
      log(`   Tipo: ${vendedorData.usuario.tipo}`);
      log(`   Token: ${vendedorData.token.substring(0, 20)}...\n`);
    } else {
      log(`⚠️  ${vendedorData.message || 'Erro ao registrar vendedor'}\n`, 'yellow');
    }

    // 2️⃣ REGISTRAR CLIENTE
    log('2️⃣ REGISTRANDO CLIENTE...', 'yellow');
    const clienteReg = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'cliente@example.com',
        senha: 'senha123456',
        nome: 'Maria Cliente',
        tipo: 'cliente',
        telefone: '11912345678'
      })
    });
    const clienteData = await clienteReg.json();
    if (clienteData.success) {
      clienteToken = clienteData.token;
      log(`✅ Cliente registrado com sucesso!`, 'green');
      log(`   Email: ${clienteData.usuario.email}`);
      log(`   Tipo: ${clienteData.usuario.tipo}`);
      log(`   Token: ${clienteData.token.substring(0, 20)}...\n`);
    } else {
      log(`⚠️  ${clienteData.message || 'Erro ao registrar cliente'}\n`, 'yellow');
    }

    // 3️⃣ LOGIN VENDEDOR
    log('3️⃣ LOGIN DO VENDEDOR...', 'yellow');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendedor@example.com',
        senha: 'senha123456'
      })
    });
    const loginData = await loginRes.json();
    if (loginData.success) {
      vendedorToken = loginData.token;
      log(`✅ Login bem-sucedido!`, 'green');
      log(`   Email: ${loginData.usuario.email}`);
      log(`   Token: ${loginData.token.substring(0, 20)}...\n`);
    }

    // 4️⃣ TENTAR CRIAR PRODUTO SEM TOKEN
    log('4️⃣ TENTANDO CRIAR PRODUTO SEM TOKEN...', 'yellow');
    const sem = await fetch(`${BASE_URL}/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Teste',
        preco: 100,
        descricao: 'Teste',
        imagem: 'https://via.placeholder.com/300x300',
        quantidade: 10,
        categoriaId: 3
      })
    });
    const semData = await sem.json();
    if (!semData.success || sem.status !== 201) {
      log(`❌ Acesso negado (esperado): ${semData.message || 'Unauthorized'}`, 'yellow');
    }
    log('');

    // 5️⃣ CRIAR PRODUTO COM TOKEN DE VENDEDOR
    log('5️⃣ CRIANDO PRODUTO COM TOKEN DE VENDEDOR...', 'yellow');
    const com = await fetch(`${BASE_URL}/produtos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vendedorToken}`
      },
      body: JSON.stringify({
        nome: 'Camiseta Vendedor',
        preco: 120,
        descricao: 'Camiseta criada por vendedor',
        imagem: 'https://via.placeholder.com/300x300?text=Camiseta+Vendedor',
        quantidade: 30,
        cor: 'Azul',
        tamanho: 'M',
        categoriaId: 3
      })
    });
    const comData = await com.json();
    if (comData.success) {
      log(`✅ Produto criado com sucesso!`, 'green');
      log(`   ID: ${comData.data.id}`);
      log(`   Nome: ${comData.data.nome}\n`);
    }

    // 6️⃣ TENTAR CRIAR PRODUTO COM TOKEN DE CLIENTE (DEVE FALHAR)
    log('6️⃣ TENTANDO CRIAR PRODUTO COM TOKEN DE CLIENTE...', 'yellow');
    const clienteProd = await fetch(`${BASE_URL}/produtos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clienteToken}`
      },
      body: JSON.stringify({
        nome: 'Teste Cliente',
        preco: 100,
        descricao: 'Teste',
        imagem: 'https://via.placeholder.com/300x300',
        quantidade: 10,
        categoriaId: 3
      })
    });
    const clienteProdData = await clienteProd.json();
    if (!clienteProdData.success || clienteProd.status === 403) {
      log(`❌ Acesso negado (esperado): ${clienteProdData.message || 'Forbidden'}`, 'yellow');
    }
    log('');

    // 7️⃣ OBTER PERFIL DO VENDEDOR
    log('7️⃣ OBTENDO PERFIL DO VENDEDOR...', 'yellow');
    const perfil = await fetch(`${BASE_URL}/auth/perfil`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vendedorToken}`
      }
    });
    const perfilData = await perfil.json();
    if (perfilData.success) {
      log(`✅ Perfil obtido com sucesso!`, 'green');
      log(`   Nome: ${perfilData.data.nome}`);
      log(`   Email: ${perfilData.data.email}`);
      log(`   Tipo: ${perfilData.data.tipo}\n`);
    }

    // RESUMO
    log('================================================', 'cyan');
    log('  ✅ TESTES CONCLUÍDOS!', 'cyan');
    log('================================================\n', 'cyan');

    log('📚 ENDPOINTS DE AUTENTICAÇÃO:', 'green');
    log('\nPOST /api/auth/register', 'cyan');
    log('  Body: { email, senha, nome, tipo, telefone? }');
    log('\nPOST /api/auth/login', 'cyan');
    log('  Body: { email, senha }');
    log('\nGET /api/auth/perfil', 'cyan');
    log('  Header: Authorization: Bearer <token>');
    log('\nPUT /api/auth/perfil', 'cyan');
    log('  Header: Authorization: Bearer <token>');
    log('  Body: { nome?, telefone? }');

    log('\n📌 ENDPOINTS PROTEGIDOS (APENAS VENDEDOR):', 'green');
    log('  POST   /api/produtos (criar)');
    log('  PUT    /api/produtos/:id (editar)');
    log('  DELETE /api/produtos/:id (deletar)');
    log('  POST   /api/categorias (criar)');
    log('  PUT    /api/categorias/:id (editar)');
    log('  DELETE /api/categorias/:id (deletar)');
    log('  GET    /api/pedidos (listar todos)');
    log('  GET    /api/pedidos/status/:status (por status)');
    log('  PUT    /api/pedidos/:id/status (atualizar status)');
    log('  DELETE /api/pedidos/:id (cancelar)\n');

  } catch (error) {
    log(`\n❌ ERRO: ${error.message}`, 'red');
    log('\nVerifique se o servidor está rodando em http://localhost:3000\n', 'yellow');
  }
}

test();
