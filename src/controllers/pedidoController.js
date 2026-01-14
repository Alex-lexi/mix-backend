import { PrismaClient } from '@prisma/client';
import { validarEmail, validarTelefone, validarNome } from '../utils/validacoes.js';

const prisma = new PrismaClient();

// Função auxiliar para gerar número do pedido
const gerarNumeroPedido = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `PED-${timestamp}-${random}`;
};

// GET - Listar todos os pedidos
export const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar pedidos',
      error: error.message,
    });
  }
};

// GET - Obter pedido por ID
export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter pedido',
      error: error.message,
    });
  }
};

// GET - Obter pedido pelo número
export const getPedidoByNumero = async (req, res) => {
  try {
    const { numeroPedido } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { numeroPedido },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter pedido',
      error: error.message,
    });
  }
};

// POST - Criar pedido a partir do carrinho
export const criarPedidoDoCarrinho = async (req, res) => {
  try {
    const { clienteId, nomeCliente, emailCliente, telefonecliente } = req.body;

    // Validações obrigatórias
    if (!clienteId || !nomeCliente || !emailCliente || !telefonecliente) {
      return res.status(400).json({
        success: false,
        message: 'clienteId, nomeCliente, emailCliente e telefonecliente são obrigatórios',
      });
    }

    // Validar nome (mínimo 3 caracteres)
    if (!validarNome(nomeCliente)) {
      return res.status(400).json({
        success: false,
        message: 'Nome do cliente deve ter pelo menos 3 caracteres',
      });
    }

    // Validar email
    if (!validarEmail(emailCliente)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
      });
    }

    // Validar telefone
    if (!validarTelefone(telefonecliente)) {
      return res.status(400).json({
        success: false,
        message: 'Telefone inválido (deve ter 10 ou 11 dígitos)',
      });
    }

    // Buscar carrinho
    const carrinho = await prisma.carrinho.findUnique({
      where: { clienteId },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!carrinho) {
      return res.status(404).json({
        success: false,
        message: 'Carrinho não encontrado',
      });
    }

    if (carrinho.itens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Carrinho vazio, adicione produtos antes de finalizar',
      });
    }

    // Criar pedido
    const numeroPedido = gerarNumeroPedido();

    const pedido = await prisma.pedido.create({
      data: {
        numeroPedido,
        nomeCliente,
        emailCliente,
        telefonecliente,
        total: carrinho.total,
        itens: {
          createMany: {
            data: carrinho.itens.map((item) => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              subtotal: item.subtotal,
            })),
          },
        },
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    // Atualizar quantidadeVendida dos produtos
    for (const item of carrinho.itens) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: {
          quantidadeVendida: {
            increment: item.quantidade,
          },
          quantidade: {
            decrement: item.quantidade,
          },
        },
      });
    }

    // Limpar carrinho
    await prisma.itemCarrinho.deleteMany({
      where: { carrinhoId: carrinho.id },
    });

    await prisma.carrinho.update({
      where: { id: carrinho.id },
      data: { total: 0 },
    });

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: pedido,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar pedido',
      error: error.message,
    });
  }
};

// PUT - Atualizar status do pedido
export const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];

    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores válidos: ${statusValidos.join(', ')}`,
      });
    }

    const pedido = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Status do pedido atualizado com sucesso',
      data: pedido,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar pedido',
      error: error.message,
    });
  }
};

// DELETE - Cancelar pedido
export const cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        itens: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    if (pedido.status === 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'Pedido já foi cancelado',
      });
    }

    // Revertê quantidades vendidas
    for (const item of pedido.itens) {
      await prisma.produto.update({
        where: { id: item.produtoId },
        data: {
          quantidadeVendida: {
            decrement: item.quantidade,
          },
          quantidade: {
            increment: item.quantidade,
          },
        },
      });
    }

    // Atualizar pedido para cancelado
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelado' },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      data: pedidoAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar pedido',
      error: error.message,
    });
  }
};

// GET - Listar pedidos por status
export const getPedidosPorStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const statusValidos = ['pendente', 'confirmado', 'enviado', 'entregue', 'cancelado'];

    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status inválido. Valores válidos: ${statusValidos.join(', ')}`,
      });
    }

    const pedidos = await prisma.pedido.findMany({
      where: { status },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: pedidos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar pedidos por status',
      error: error.message,
    });
  }
};
