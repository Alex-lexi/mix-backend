import { Router } from 'express';
import {
  getCarrinho,
  adicionarProduto,
  atualizarQuantidade,
  removerProduto,
  limparCarrinho,
} from '../controllers/carrinhoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas do carrinho requerem autenticação
router.use(verificarToken);

/**
 * @swagger
 * tags:
 *   name: Carrinho
 *   description: Gerenciamento do carrinho de compras (requer autenticação)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemCarrinho:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do item no carrinho
 *         produtoId:
 *           type: integer
 *           description: ID do produto
 *         quantidade:
 *           type: integer
 *           description: Quantidade do produto
 *         precoUnitario:
 *           type: number
 *           description: Preço unitário do produto
 *         subtotal:
 *           type: number
 *           description: Subtotal (quantidade × preço)
 *         produto:
 *           type: object
 *           description: Informações do produto
 *     Carrinho:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do carrinho
 *         usuarioId:
 *           type: integer
 *           description: ID do usuário proprietário
 *         usuario:
 *           type: object
 *           description: Informações do usuário
 *         total:
 *           type: number
 *           description: Valor total do carrinho
 *         itens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemCarrinho'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/carrinho:
 *   get:
 *     summary: Obter carrinho do usuário autenticado
 *     description: Retorna o carrinho de compras do usuário logado. Se não existir, cria um novo carrinho automaticamente.
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Carrinho'
 *       401:
 *         description: Não autenticado ou token inválido
 *       500:
 *         description: Erro ao obter carrinho
 */
router.get('/', getCarrinho);

/**
 * @swagger
 * /api/carrinho/adicionar:
 *   post:
 *     summary: Adicionar produto ao carrinho
 *     description: Adiciona um produto ao carrinho do usuário autenticado. Se o produto já existir, incrementa a quantidade. Valida estoque disponível e aplica preço promocional automaticamente.
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - produtoId
 *               - quantidade
 *             properties:
 *               produtoId:
 *                 type: integer
 *                 description: ID do produto a ser adicionado
 *                 example: 1
 *               quantidade:
 *                 type: integer
 *                 description: Quantidade a adicionar (deve ser > 0)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Produto adicionado com sucesso
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
 *                   example: "Produto adicionado ao carrinho com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Carrinho'
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro ao adicionar produto
 */
router.post('/adicionar', adicionarProduto);

/**
 * @swagger
 * /api/carrinho/itens/{itemId}:
 *   put:
 *     summary: Atualizar quantidade de um item no carrinho
 *     description: Atualiza a quantidade de um item específico no carrinho do usuário. Valida estoque e recalcula valores automaticamente. Aplica preço promocional se disponível.
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item no carrinho
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantidade
 *             properties:
 *               quantidade:
 *                 type: integer
 *                 description: Nova quantidade (deve ser > 0)
 *                 example: 3
 *     responses:
 *       200:
 *         description: Quantidade atualizada com sucesso
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
 *                   example: "Quantidade atualizada com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Carrinho'
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Item não pertence ao seu carrinho
 *       404:
 *         description: Carrinho ou item não encontrado
 *       500:
 *         description: Erro ao atualizar quantidade
 *   delete:
 *     summary: Remover produto do carrinho
 *     description: Remove completamente um item específico do carrinho do usuário autenticado. O total é recalculado automaticamente.
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do item a ser removido
 *         example: 5
 *     responses:
 *       200:
 *         description: Produto removido com sucesso
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
 *                   example: "Produto removido do carrinho com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Carrinho'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Item não pertence ao seu carrinho
 *       404:
 *         description: Carrinho ou item não encontrado
 *       500:
 *         description: Erro ao remover produto
 */
router.put('/itens/:itemId', atualizarQuantidade);
router.delete('/itens/:itemId', removerProduto);

/**
 * @swagger
 * /api/carrinho/limpar:
 *   delete:
 *     summary: Limpar carrinho
 *     description: Remove todos os itens do carrinho do usuário autenticado, zerrando o total. Útil após finalizar um pedido.
 *     tags: [Carrinho]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrinho limpo com sucesso
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
 *                   example: "Carrinho limpo com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Carrinho'
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Carrinho não encontrado
 *       500:
 *         description: Erro ao limpar carrinho
 */
router.delete('/limpar', limparCarrinho);

export default router;
