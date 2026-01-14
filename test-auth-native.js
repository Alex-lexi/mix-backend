import http from 'http';

const BASE_URL = 'localhost';
const BASE_PORT = 3000;

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

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: BASE_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function addAuthHeader(path, token, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: BASE_PORT,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

function addAuthHeaderPost(path, token, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: BASE_PORT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  log('\n================================================', 'cyan');
  log('  🔐 TESTES DE AUTENTICAÇÃO JWT', 'cyan');
  log('================================================\n', 'cyan');

  try {
    // 1️⃣ REGISTRAR VENDEDOR
    log('1️⃣ REGISTRANDO VENDEDOR...', 'yellow');
    const vendedorReg = await makeRequest('POST', '/api/auth/register', {
      email: 'vendedor@example.com',
      senha: 'senha123456',
      nome: 'João Vendedor',
      tipo: 'vendedor',
      telefone: '11987654321'
    });

    if (vendedorReg.body.success) {
      vendedorToken = vendedorReg.body.token;
      log(`✅ Vendedor registrado com sucesso!`, 'green');
      log(`   Email: ${vendedorReg.body.usuario.email}`);
      log(`   Tipo: ${vendedorReg.body.usuario.tipo}`);
      log(`   Token: ${vendedorReg.body.token.substring(0, 20)}...\n`);
    } else {
      log(`⚠️  ${vendedorReg.body.message || 'Erro ao registrar vendedor'}\n`, 'yellow');
    }

    // 2️⃣ REGISTRAR CLIENTE
    log('2️⃣ REGISTRANDO CLIENTE...', 'yellow');
    const clienteReg = await makeRequest('POST', '/api/auth/register', {
      email: 'cliente@example.com',
      senha: 'senha123456',
      nome: 'Maria Cliente',
      tipo: 'cliente',
      telefone: '11912345678'
    });

    if (clienteReg.body.success) {
      clienteToken = clienteReg.body.token;
      log(`✅ Cliente registrado com sucesso!`, 'green');
      log(`   Email: ${clienteReg.body.usuario.email}`);
      log(`   Tipo: ${clienteReg.body.usuario.tipo}`);
      log(`   Token: ${clienteReg.body.token.substring(0, 20)}...\n`);
    } else {
      log(`⚠️  ${clienteReg.body.message || 'Erro ao registrar cliente'}\n`, 'yellow');
    }

    // 3️⃣ LOGIN VENDEDOR
    log('3️⃣ LOGIN DO VENDEDOR...', 'yellow');
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'vendedor@example.com',
      senha: 'senha123456'
    });

    if (loginRes.body.success) {
      vendedorToken = loginRes.body.token;
      log(`✅ Login bem-sucedido!`, 'green');
      log(`   Email: ${loginRes.body.usuario.email}`);
      log(`   Token: ${loginRes.body.token.substring(0, 20)}...\n`);
    }

    // 4️⃣ TENTAR CRIAR PRODUTO SEM TOKEN
    log('4️⃣ TENTANDO CRIAR PRODUTO SEM TOKEN...', 'yellow');
    const sem = await makeRequest('POST', '/api/produtos', {
      nome: 'Teste',
      preco: 100,
      descricao: 'Teste',
      imagem: 'https://via.placeholder.com/300x300',
      quantidade: 10,
      categoriaId: 3
    });

    if (!sem.body.success || sem.status !== 201) {
      log(`❌ Acesso negado (esperado): ${sem.body.message || 'Unauthorized'}`, 'yellow');
    }
    log('');

    // 5️⃣ CRIAR PRODUTO COM TOKEN DE VENDEDOR
    log('5️⃣ CRIANDO PRODUTO COM TOKEN DE VENDEDOR...', 'yellow');
    const com = await addAuthHeaderPost('/api/produtos', vendedorToken, {
      nome: 'Camiseta Vendedor',
      preco: 120,
      descricao: 'Camiseta criada por vendedor',
      imagem: 'https://via.placeholder.com/300x300?text=Camiseta+Vendedor',
      quantidade: 30,
      cor: 'Azul',
      tamanho: 'M',
      categoriaId: 3
    });

    if (com.body.success) {
      log(`✅ Produto criado com sucesso!`, 'green');
      log(`   ID: ${com.body.data.id}`);
      log(`   Nome: ${com.body.data.nome}\n`);
    } else {
      log(`❌ Erro: ${com.body.message}\n`, 'red');
    }

    // 6️⃣ TENTAR CRIAR PRODUTO COM TOKEN DE CLIENTE
    log('6️⃣ TENTANDO CRIAR PRODUTO COM TOKEN DE CLIENTE...', 'yellow');
    const clienteProd = await addAuthHeaderPost('/api/produtos', clienteToken, {
      nome: 'Teste Cliente',
      preco: 100,
      descricao: 'Teste',
      imagem: 'https://via.placeholder.com/300x300',
      quantidade: 10,
      categoriaId: 3
    });

    if (!clienteProd.body.success || clienteProd.status === 403) {
      log(`❌ Acesso negado (esperado): ${clienteProd.body.message || 'Forbidden'}`, 'yellow');
    }
    log('');

    // 7️⃣ OBTER PERFIL DO VENDEDOR
    log('7️⃣ OBTENDO PERFIL DO VENDEDOR...', 'yellow');
    const perfil = await addAuthHeader('/api/auth/perfil', vendedorToken);

    if (perfil.body.success) {
      log(`✅ Perfil obtido com sucesso!`, 'green');
      log(`   Nome: ${perfil.body.data.nome}`);
      log(`   Email: ${perfil.body.data.email}`);
      log(`   Tipo: ${perfil.body.data.tipo}\n`);
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

test().then(() => process.exit(0)).catch(() => process.exit(1));
