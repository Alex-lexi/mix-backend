import { Router } from 'express';
import {
  getAllPedidos,
  getPedidoById,
  getPedidoByNumero,
  criarPedidoDoCarrinho,
  atualizarStatusPedido,
  cancelarPedido,
  getPedidosPorStatus,
} from '../controllers/pedidoController.js';
import {
  verificarToken,
  verificarVendedor,
} from '../middlewares/authMiddleware.js';

const router = Router();

// GET - Listar todos os pedidos (apenas vendedor)
router.get('/', verificarToken, verificarVendedor, getAllPedidos);

// GET - Listar pedidos por status (apenas vendedor)
router.get('/status/:status', verificarToken, verificarVendedor, getPedidosPorStatus);

// GET - Obter pedido por número
router.get('/numero/:numeroPedido', getPedidoByNumero);

// GET - Obter pedido por ID
router.get('/:id', getPedidoById);

// POST - Criar pedido a partir do carrinho
router.post('/', criarPedidoDoCarrinho);

// PUT - Atualizar status do pedido (apenas vendedor)
router.put('/:id/status', verificarToken, verificarVendedor, atualizarStatusPedido);

// DELETE - Cancelar pedido (apenas vendedor)
router.delete('/:id', verificarToken, verificarVendedor, cancelarPedido);

export default router;
