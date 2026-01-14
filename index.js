import express from 'express';
import cors from 'cors';
import { specs, swaggerUi } from './src/swagger.js';
import authRoutes from './src/routes/authRoutes.js';
import categoriaRoutes from './src/routes/categoriaRoutes.js';
import produtoRoutes from './src/routes/produtoRoutes.js';
import carrinhoRoutes from './src/routes/carrinhoRoutes.js';
import pedidoRoutes from './src/routes/pedidoRoutes.js';
import { criarAdminPrincipal } from './src/utils/criarAdmin.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.json({ message: 'Servidor Mix Backend está rodando!', docs: '/api-docs' });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/carrinho', carrinhoRoutes);
app.use('/api/pedidos', pedidoRoutes);

// Criar administrador principal na inicialização
criarAdminPrincipal().catch(console.error);

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({
    success: false,
    message: 'Erro no servidor',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Documentação Swagger: http://localhost:${PORT}/api-docs`);
});
