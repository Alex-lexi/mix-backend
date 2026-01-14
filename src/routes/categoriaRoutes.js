import { Router } from 'express';
import {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from '../controllers/categoriaController.js';
import {
  verificarToken,
  verificarVendedor,
  verificarVendedorOuAdmin,
} from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gestão de categorias de produtos
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Lista todas as categorias
 *     description: Retorna todas as categorias cadastradas com seus produtos
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Categoria'
 *                       - type: object
 *                         properties:
 *                           produtos:
 *                             type: array
 *                             items:
 *                               $ref: '#/components/schemas/Produto'
 *       500:
 *         description: Erro ao listar categorias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllCategorias);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtém categoria por ID
 *     description: Retorna uma categoria específica com seus produtos
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Categoria'
 *                     - type: object
 *                       properties:
 *                         produtos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Produto'
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao obter categoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getCategoriaById);

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Cria nova categoria
 *     description: Cria uma nova categoria (apenas vendedores autenticados)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da categoria
 *                 example: Eletrônicos
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Categoria criada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Nome da categoria é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *       403:
 *         description: Acesso negado - Apenas vendedores podem criar categorias
 *       500:
 *         description: Erro ao criar categoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', verificarToken, verificarVendedorOuAdmin, createCategoria);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Atualiza categoria
 *     description: Atualiza uma categoria existente (apenas vendedores autenticados)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Novo nome da categoria
 *                 example: Eletrônicos e Informática
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Categoria atualizada com sucesso
 *                 data:
 *                   $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Nome da categoria é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *       403:
 *         description: Acesso negado - Apenas vendedores podem atualizar categorias
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao atualizar categoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', verificarToken, verificarVendedorOuAdmin, updateCategoria);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Deleta categoria
 *     description: Remove uma categoria existente (apenas vendedores autenticados)
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Categoria deletada com sucesso
 *       401:
 *         description: Não autorizado - Token inválido ou ausente
 *       403:
 *         description: Acesso negado - Apenas vendedores podem deletar categorias
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao deletar categoria
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', verificarToken, verificarVendedorOuAdmin, deleteCategoria);

export default router;
