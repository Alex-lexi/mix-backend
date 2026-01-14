import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mix Backend API',
      version: '1.0.0',
      description: 'API de e-commerce com autenticação JWT, gestão de produtos, carrinho e pedidos',
      contact: {
        name: 'Mix Team',
        url: 'https://github.com/Alex-lexi/mix-backend'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            nome: { type: 'string' },
            tipo: { type: 'string', enum: ['vendedor', 'cliente'] },
            telefone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Categoria: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Produto: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            preco: { type: 'number', format: 'float' },
            descricao: { type: 'string' },
            imagem: { type: 'string', format: 'uri' },
            quantidade: { type: 'integer' },
            cor: { type: 'string' },
            tamanho: { type: 'string' },
            categoriaId: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ItemCarrinho: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            produtoId: { type: 'integer' },
            quantidade: { type: 'integer' },
            carrinhoId: { type: 'integer' }
          }
        },
        Carrinho: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            clienteId: { type: 'string' },
            usuarioId: { type: 'integer', nullable: true },
            itens: { type: 'array', items: { $ref: '#/components/schemas/ItemCarrinho' } },
            total: { type: 'number', format: 'float' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ItemPedido: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            produtoId: { type: 'integer' },
            quantidade: { type: 'integer' },
            preco: { type: 'number', format: 'float' },
            pedidoId: { type: 'integer' }
          }
        },
        Pedido: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            numeroPedido: { type: 'string' },
            clienteId: { type: 'string' },
            usuarioId: { type: 'integer', nullable: true },
            status: { type: 'string', enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'] },
            total: { type: 'number', format: 'float' },
            itens: { type: 'array', items: { $ref: '#/components/schemas/ItemPedido' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string', description: 'JWT token' },
            usuario: { $ref: '#/components/schemas/Usuario' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
