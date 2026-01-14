import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todas as categorias
export const getAllCategorias = async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        produtos: true,
      },
    });

    res.status(200).json({
      success: true,
      data: categorias,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar categorias',
      error: error.message,
    });
  }
};

// GET - Obter categoria por ID
export const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(id) },
      include: {
        produtos: true,
      },
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: categoria,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter categoria',
      error: error.message,
    });
  }
};

// POST - Criar nova categoria
export const createCategoria = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório',
      });
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: categoria,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar categoria',
      error: error.message,
    });
  }
};

// PUT - Atualizar categoria
export const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Nome da categoria é obrigatório',
      });
    }

    const categoria = await prisma.categoria.update({
      where: { id: parseInt(id) },
      data: { nome },
    });

    res.status(200).json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: categoria,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar categoria',
      error: error.message,
    });
  }
};

// DELETE - Deletar categoria
export const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há produtos associados
    const produtosCount = await prisma.produto.count({
      where: { categoriaId: parseInt(id) },
    });

    if (produtosCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar uma categoria com produtos associados',
      });
    }

    await prisma.categoria.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Categoria deletada com sucesso',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao deletar categoria',
      error: error.message,
    });
  }
};
