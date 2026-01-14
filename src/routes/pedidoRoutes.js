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
  verificarVendedorOuAdmin,
} from '../middlewares/authMiddleware.js';

const router = Router();

// GET - Listar todos os pedidos (vendedor ou admin)
router.get('/', verificarToken, verificarVendedorOuAdmin, getAllPedidos);

// GET - Listar pedidos por status (vendedor ou admin)
router.get('/status/:status', verificarToken, verificarVendedorOuAdmin, getPedidosPorStatus);

// GET - Obter pedido por número
router.get('/numero/:numeroPedido', getPedidoByNumero);

// GET - Obter pedido por ID
router.get('/:id', getPedidoById);

// POST - Criar pedido a partir do carrinho
router.post('/', criarPedidoDoCarrinho);

// PUT - Atualizar status do pedido (vendedor ou admin)
router.put('/:id/status', verificarToken, verificarVendedorOuAdmin, atualizarStatusPedido);

// DELETE - Cancelar pedido (vendedor ou admin)
router.delete('/:id', verificarToken, verificarVendedorOuAdmin, cancelarPedido);

export default router;
