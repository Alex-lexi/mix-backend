import { PrismaClient } from '@prisma/client';
import { validarQuantidade } from '../utils/validacoes.js';

const prisma = new PrismaClient();

// Função auxiliar para obter ou criar carrinho do usuário autenticado
const obterOuCriarCarrinho = async (usuarioId) => {
  let carrinho = await prisma.carrinho.findUnique({
    where: { usuarioId: parseInt(usuarioId) },
    include: {
      itens: {
        include: {
          produto: {
            include: {
              categoria: true,
            },
          },
        },
      },
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
    },
  });

  if (!carrinho) {
    carrinho = await prisma.carrinho.create({
      data: {
        usuarioId: parseInt(usuarioId),
      },
      include: {
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  return carrinho;
};

// GET - Obter carrinho do usuário autenticado
export const getCarrinho = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const carrinho = await obterOuCriarCarrinho(usuarioId);

    res.status(200).json({
      success: true,
      data: carrinho,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter carrinho',
      error: error.message,
    });
  }
};

// POST - Adicionar produto ao carrinho do usuário autenticado
export const adicionarProduto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { produtoId, quantidade } = req.body;

    if (!produtoId || !quantidade) {
      return res.status(400).json({
        success: false,
        message: 'produtoId e quantidade são obrigatórios',
      });
    }

    if (!validarQuantidade(quantidade)) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade deve ser um número inteiro positivo',
      });
    }

    if (quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade deve ser maior que zero',
      });
    }

    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(produtoId) },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    // Verificar estoque disponível
    if (produto.quantidade < quantidade) {
      return res.status(400).json({
        success: false,
        message: `Estoque insuficiente. Disponível: ${produto.quantidade}`,
      });
    }

    const carrinho = await obterOuCriarCarrinho(usuarioId);

    const itemExistente = await prisma.itemCarrinho.findFirst({
      where: {
        carrinhoId: carrinho.id,
        produtoId: parseInt(produtoId),
      },
    });

    // Usar preço promocional se estiver em promoção
    const precoFinal = produto.emPromocao && produto.precoPromocional 
      ? produto.precoPromocional 
      : produto.preco;

    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + parseInt(quantidade);
      
      // Verificar estoque para a nova quantidade
      if (produto.quantidade < novaQuantidade) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente. Você já tem ${itemExistente.quantidade} no carrinho. Disponível: ${produto.quantidade}`,
        });
      }
      
      await prisma.itemCarrinho.update({
        where: { id: itemExistente.id },
        data: {
          quantidade: novaQuantidade,
          precoUnitario: precoFinal,
          subtotal: novaQuantidade * precoFinal,
        },
      });
    } else {
      await prisma.itemCarrinho.create({
        data: {
          carrinhoId: carrinho.id,
          produtoId: parseInt(produtoId),
          quantidade: parseInt(quantidade),
          precoUnitario: precoFinal,
          subtotal: precoFinal * parseInt(quantidade),
        },
      });
    }

    const itens = await prisma.itemCarrinho.findMany({
      where: { carrinhoId: carrinho.id },
    });

    const total = itens.reduce((sum, it) => sum + it.subtotal, 0);

    await prisma.carrinho.update({
      where: { id: carrinho.id },
      data: { total },
    });

    const carrinhoAtualizado = await prisma.carrinho.findUnique({
      where: { id: carrinho.id },
      include: {
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Produto adicionado ao carrinho com sucesso',
      data: carrinhoAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar produto ao carrinho',
      error: error.message,
    });
  }
};

// PUT - Atualizar quantidade de um item
export const atualizarQuantidade = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { itemId } = req.params;
    const { quantidade } = req.body;

    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade deve ser maior que zero',
      });
    }

    if (!validarQuantidade(quantidade)) {
      return res.status(400).json({
        success: false,
        message: 'Quantidade deve ser um número inteiro positivo',
      });
    }

    const carrinho = await prisma.carrinho.findUnique({
      where: { usuarioId: parseInt(usuarioId) },
    });

    if (!carrinho) {
      return res.status(404).json({
        success: false,
        message: 'Carrinho não encontrado',
      });
    }

    const item = await prisma.itemCarrinho.findUnique({
      where: { id: parseInt(itemId) },
      include: { produto: true },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    if (item.carrinhoId !== carrinho.id) {
      return res.status(403).json({
        success: false,
        message: 'Este item não pertence ao seu carrinho',
      });
    }

    // Verificar estoque disponível
    if (item.produto.quantidade < parseInt(quantidade)) {
      return res.status(400).json({
        success: false,
        message: `Estoque insuficiente. Disponível: ${item.produto.quantidade}`,
      });
    }

    // Usar preço promocional se disponível
    const precoFinal = item.produto.emPromocao && item.produto.precoPromocional 
      ? item.produto.precoPromocional 
      : item.produto.preco;

    await prisma.itemCarrinho.update({
      where: { id: parseInt(itemId) },
      data: {
        quantidade: parseInt(quantidade),
        precoUnitario: precoFinal,
        subtotal: precoFinal * parseInt(quantidade),
      },
    });

    const itens = await prisma.itemCarrinho.findMany({
      where: { carrinhoId: carrinho.id },
    });

    const total = itens.reduce((sum, it) => sum + it.subtotal, 0);

    await prisma.carrinho.update({
      where: { id: carrinho.id },
      data: { total },
    });

    const carrinhoAtualizado = await prisma.carrinho.findUnique({
      where: { id: carrinho.id },
      include: {
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Quantidade atualizada com sucesso',
      data: carrinhoAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar quantidade',
      error: error.message,
    });
  }
};

// DELETE - Remover produto do carrinho
export const removerProduto = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { itemId } = req.params;

    const carrinho = await prisma.carrinho.findUnique({
      where: { usuarioId: parseInt(usuarioId) },
    });

    if (!carrinho) {
      return res.status(404).json({
        success: false,
        message: 'Carrinho não encontrado',
      });
    }

    const item = await prisma.itemCarrinho.findUnique({
      where: { id: parseInt(itemId) },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado',
      });
    }

    if (item.carrinhoId !== carrinho.id) {
      return res.status(403).json({
        success: false,
        message: 'Este item não pertence ao seu carrinho',
      });
    }

    await prisma.itemCarrinho.delete({
      where: { id: parseInt(itemId) },
    });

    const itens = await prisma.itemCarrinho.findMany({
      where: { carrinhoId: carrinho.id },
    });

    const total = itens.reduce((sum, it) => sum + it.subtotal, 0);

    await prisma.carrinho.update({
      where: { id: carrinho.id },
      data: { total },
    });

    const carrinhoAtualizado = await prisma.carrinho.findUnique({
      where: { id: carrinho.id },
      include: {
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Produto removido do carrinho com sucesso',
      data: carrinhoAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao remover produto',
      error: error.message,
    });
  }
};

// DELETE - Limpar carrinho
export const limparCarrinho = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const carrinho = await prisma.carrinho.findUnique({
      where: { usuarioId: parseInt(usuarioId) },
    });

    if (!carrinho) {
      return res.status(404).json({
        success: false,
        message: 'Carrinho não encontrado',
      });
    }

    await prisma.itemCarrinho.deleteMany({
      where: { carrinhoId: carrinho.id },
    });

    const carrinhoAtualizado = await prisma.carrinho.update({
      where: { id: carrinho.id },
      data: { total: 0 },
      include: {
        itens: {
          include: {
            produto: {
              include: {
                categoria: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Carrinho limpo com sucesso',
      data: carrinhoAtualizado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao limpar carrinho',
      error: error.message,
    });
  }
};
