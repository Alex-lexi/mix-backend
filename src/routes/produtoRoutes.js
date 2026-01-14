import { Router } from 'express';
import {
  getAllProdutos,
  getProdutoById,
  buscarProdutosPorNome,
  getProdutosPorCategoria,
  getProdutosBestseller,
  getMaisVendidos,
  getNovidades,
  getProdutosEmPromocao,
  definirPromocao,
  getProdutosSimilares,
  createProduto,
  updateProduto,
  deleteProduto,
  filtrarProdutos,
  buscaGlobal,
} from '../controllers/produtoController.js';
import {
  verificarToken,
  verificarVendedor,
} from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Listar todos os produtos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produto'
 */
router.get('/', getAllProdutos);

/**
 * @swagger
 * /api/produtos/buscar/global/search:
 *   get:
 *     summary: Busca global em produtos, categorias e descrições
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: camiseta
 *     responses:
 *       200:
 *         description: Resultados da busca
 */
router.get('/buscar/global/search', buscaGlobal);

/**
 * @swagger
 * /api/produtos/filtrar/avancado/search:
 *   get:
 *     summary: Filtros avançados de produtos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: precoMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: precoMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cor
 *         schema:
 *           type: string
 *       - in: query
 *         name: tamanho
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produtos filtrados
 */
router.get('/filtrar/avancado/search', filtrarProdutos);

/**
 * @swagger
 * /api/produtos/bestsellers/lista:
 *   get:
 *     summary: Produtos mais vendidos
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de produtos a retornar
 *     responses:
 *       200:
 *         description: Lista de bestsellers
 */
router.get('/bestsellers/lista', getProdutosBestseller);

/**
 * @swagger
 * /api/produtos/mais-vendidos/lista:
 *   get:
 *     summary: Produtos mais vendidos (ordenados por quantidade vendida)
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de produtos a retornar
 *     responses:
 *       200:
 *         description: Lista de produtos mais vendidos
 */
router.get('/mais-vendidos/lista', getMaisVendidos);

/**
 * @swagger
 * /api/produtos/novidades/lista:
 *   get:
 *     summary: Produtos novidades (recém cadastrados)
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de produtos a retornar
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Produtos criados nos últimos X dias
 *     responses:
 *       200:
 *         description: Lista de produtos novidades
 */
router.get('/novidades/lista', getNovidades);

/**
 * @swagger
 * /api/produtos/promocoes/lista:
 *   get:
 *     summary: Produtos em promoção
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número máximo de produtos a retornar
 *     responses:
 *       200:
 *         description: Lista de produtos em promoção
 */
router.get('/promocoes/lista', getProdutosEmPromocao);

/**
 * @swagger
 * /api/produtos/busca/search:
 *   get:
 *     summary: Buscar produtos por nome
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produtos encontrados
 */
router.get('/busca/search', buscarProdutosPorNome);

/**
 * @swagger
 * /api/produtos/categoria/{categoriaId}:
 *   get:
 *     summary: Produtos de uma categoria
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: categoriaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produtos da categoria
 */
router.get('/categoria/:categoriaId', getProdutosPorCategoria);

/**
 * @swagger
 * /api/produtos/similares/{id}:
 *   get:
 *     summary: Produtos similares
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produtos similares encontrados
 */
router.get('/similares/:id', getProdutosSimilares);

/**
 * @swagger
 * /api/produtos/{id}:
 *   get:
 *     summary: Obter produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', getProdutoById);

/**
 * @swagger
 * /api/produtos:
 *   post:
 *     summary: Criar novo produto
 *     description: Apenas vendedores autenticados podem criar produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               descricao:
 *                 type: string
 *               imagem:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *               categoriaId:
 *                 type: integer
 *               cor:
 *                 type: string
 *               tamanho:
 *                 type: string
 *             required: [nome, preco, descricao, imagem, quantidade, categoriaId]
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       403:
 *         description: Apenas vendedores podem criar produtos
 */
router.post('/', verificarToken, verificarVendedor, createProduto);

/**
 * @swagger
 * /api/produtos/{id}:
 *   put:
 *     summary: Atualizar produto
 *     description: Apenas vendedores autenticados podem atualizar produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               preco:
 *                 type: number
 *               descricao:
 *                 type: string
 *               imagem:
 *                 type: string
 *               quantidade:
 *                 type: integer
 *               categoriaId:
 *                 type: integer
 *               emPromocao:
 *                 type: boolean
 *               precoPromocional:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       403:
 *         description: Apenas vendedores podem atualizar produtos
 */
router.put('/:id', verificarToken, verificarVendedor, updateProduto);

/**
 * @swagger
 * /api/produtos/{id}/promocao:
 *   put:
 *     summary: Definir ou remover promoção de um produto
 *     description: Apenas vendedores autenticados podem definir promoções
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emPromocao:
 *                 type: boolean
 *                 required: true
 *                 description: Define se o produto está em promoção
 *               precoPromocional:
 *                 type: number
 *                 description: Preço promocional (obrigatório se emPromocao for true)
 *             required: [emPromocao]
 *           example:
 *             emPromocao: true
 *             precoPromocional: 59.90
 *     responses:
 *       200:
 *         description: Promoção definida ou removida com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Apenas vendedores podem definir promoções
 *       404:
 *         description: Produto não encontrado
 */
router.put('/:id/promocao', verificarToken, verificarVendedor, definirPromocao);

/**
 * @swagger
 * /api/produtos/{id}:
 *   delete:
 *     summary: Deletar produto
 *     description: Apenas vendedores autenticados podem deletar produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto deletado com sucesso
 *       403:
 *         description: Apenas vendedores podem deletar produtos
 */
router.delete('/:id', verificarToken, verificarVendedor, deleteProduto);

export default router;
