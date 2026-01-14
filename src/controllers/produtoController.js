import { PrismaClient } from '@prisma/client';
import { validarPreco, validarQuantidade, validarNome, validarURL } from '../utils/validacoes.js';

const prisma = new PrismaClient();

// GET - Listar todos os produtos
export const getAllProdutos = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true,
      },
    });

    res.status(200).json({
      success: true,
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos',
      error: error.message,
    });
  }
};

// GET - Obter produto por ID
export const getProdutoById = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
      include: {
        categoria: true,
      },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: produto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter produto',
      error: error.message,
    });
  }
};

// GET - Buscar produtos por nome
export const buscarProdutosPorNome = async (req, res) => {
  try {
    const { nome } = req.query;

    if (!nome) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "nome" é obrigatório',
      });
    }

    const produtos = await prisma.produto.findMany({
      where: {
        nome: {
          contains: nome,
          mode: 'insensitive',
        },
      },
      include: {
        categoria: true,
      },
    });

    res.status(200).json({
      success: true,
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar produtos',
      error: error.message,
    });
  }
};

// GET - Produtos por categoria
export const getProdutosPorCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params;

    const produtos = await prisma.produto.findMany({
      where: { categoriaId: parseInt(categoriaId) },
      include: {
        categoria: true,
      },
    });

    res.status(200).json({
      success: true,
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos da categoria',
      error: error.message,
    });
  }
};

// GET - Produtos mais vendidos (ordenados por quantidade vendida)
export const getProdutosBestseller = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const produtos = await prisma.produto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        quantidadeVendida: 'desc',
      },
      take: limit,
    });

    res.status(200).json({
      success: true,
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar bestsellers',
      error: error.message,
    });
  }
};

// GET - Produtos mais vendidos (alias para getProdutosBestseller)
export const getMaisVendidos = async (req, res) => {
  return getProdutosBestseller(req, res);
};

// GET - Produtos novidades (recém cadastrados)
export const getNovidades = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const diasNovidade = parseInt(req.query.dias) || 30; // Padrão: 30 dias

    // Calcular data limite (produtos criados nos últimos X dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - diasNovidade);

    const produtos = await prisma.produto.findMany({
      where: {
        createdAt: {
          gte: dataLimite,
        },
      },
      include: {
        categoria: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    res.status(200).json({
      success: true,
      total: produtos.length,
      filtros: {
        dias: diasNovidade,
        dataLimite: dataLimite.toISOString(),
      },
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos novidades',
      error: error.message,
    });
  }
};

// GET - Produtos em promoção
export const getProdutosEmPromocao = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const produtos = await prisma.produto.findMany({
      where: {
        emPromocao: true,
      },
      include: {
        categoria: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    res.status(200).json({
      success: true,
      total: produtos.length,
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos em promoção',
      error: error.message,
    });
  }
};

// PUT - Definir promoção em um produto
export const definirPromocao = async (req, res) => {
  try {
    const { id } = req.params;
    const { emPromocao, precoPromocional } = req.body;

    // Validações
    if (emPromocao === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Campo "emPromocao" é obrigatório',
      });
    }

    // Se está colocando em promoção, o preço promocional é obrigatório
    if (emPromocao && !precoPromocional) {
      return res.status(400).json({
        success: false,
        message: 'Campo "precoPromocional" é obrigatório quando emPromocao é true',
      });
    }

    // Buscar produto para validar preço promocional
    const produtoAtual = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!produtoAtual) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    // Validar se preço promocional é menor que o preço normal
    if (emPromocao && parseFloat(precoPromocional) >= produtoAtual.preco) {
      return res.status(400).json({
        success: false,
        message: 'Preço promocional deve ser menor que o preço normal',
      });
    }

    // Validar se preço promocional é positivo
    if (emPromocao && parseFloat(precoPromocional) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Preço promocional deve ser maior que zero',
      });
    }

    const dataUpdate = {
      emPromocao: emPromocao,
      precoPromocional: emPromocao ? parseFloat(precoPromocional) : null,
    };

    const produto = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: dataUpdate,
      include: {
        categoria: true,
      },
    });

    res.status(200).json({
      success: true,
      message: emPromocao 
        ? `Promoção definida com sucesso! Preço: R$ ${produtoAtual.preco.toFixed(2)} → R$ ${precoPromocional}` 
        : 'Promoção removida com sucesso',
      data: produto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao definir promoção',
      error: error.message,
    });
  }
};

// GET - Produtos similares (mesma categoria)
export const getProdutosSimilares = async (req, res) => {
  try {
    const { id } = req.params;

    const produto = await prisma.produto.findUnique({
      where: { id: parseInt(id) },
    });

    if (!produto) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    const produtosSimilares = await prisma.produto.findMany({
      where: {
        categoriaId: produto.categoriaId,
        id: { not: parseInt(id) },
      },
      include: {
        categoria: true,
      },
      take: 5,
    });

    res.status(200).json({
      success: true,
      data: produtosSimilares,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao listar produtos similares',
      error: error.message,
    });
  }
};

// POST - Criar novo produto
export const createProduto = async (req, res) => {
  try {
    const { nome, preco, descricao, imagem, quantidade, categoriaId, cor, tamanho, emPromocao, precoPromocional } = req.body;

    // Validações obrigatórias
    if (!nome || !preco || !descricao || !imagem || !categoriaId) {
      return res.status(400).json({
        success: false,
        message: 'nome, preco, descricao, imagem e categoriaId são obrigatórios',
      });
    }

    // Validar nome (mínimo 3 caracteres)
    if (!validarNome(nome)) {
      return res.status(400).json({
        success: false,
        message: 'Nome do produto deve ter pelo menos 3 caracteres',
      });
    }

    // Validar preço (deve ser positivo)
    if (!validarPreco(preco)) {
      return res.status(400).json({
        success: false,
        message: 'Preço deve ser um valor positivo',
      });
    }

    // Validar quantidade (se fornecida, deve ser positiva ou zero)
    if (quantidade !== undefined && quantidade !== null && !validarQuantidade(quantidade)) {
      if (parseInt(quantidade) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantidade não pode ser negativa',
        });
      }
    }

    // Validar URL de imagem
    if (!validarURL(imagem)) {
      return res.status(400).json({
        success: false,
        message: 'URL de imagem inválida',
      });
    }

    // Validar promoção
    if (emPromocao && !precoPromocional) {
      return res.status(400).json({
        success: false,
        message: 'precoPromocional é obrigatório quando emPromocao é true',
      });
    }

    if (emPromocao && parseFloat(precoPromocional) >= parseFloat(preco)) {
      return res.status(400).json({
        success: false,
        message: 'Preço promocional deve ser menor que o preço normal',
      });
    }

    // Verificar se categoria existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: parseInt(categoriaId) },
    });

    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoria não encontrada',
      });
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        preco: parseFloat(preco),
        descricao,
        imagem,
        quantidade: parseInt(quantidade) || 0,
        cor: cor || null,
        tamanho: tamanho || null,
        categoriaId: parseInt(categoriaId),
        emPromocao: emPromocao || false,
        precoPromocional: emPromocao ? parseFloat(precoPromocional) : null,
      },
      include: {
        categoria: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso',
      data: produto,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao criar produto',
      error: error.message,
    });
  }
};

// PUT - Atualizar produto
export const updateProduto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, descricao, imagem, quantidade, categoriaId, isBestseller, quantidadeVendida, emPromocao, precoPromocional } = req.body;

    const dataUpdate = {};

    if (nome) dataUpdate.nome = nome;
    if (preco) dataUpdate.preco = parseFloat(preco);
    if (descricao) dataUpdate.descricao = descricao;
    if (imagem) dataUpdate.imagem = imagem;
    if (quantidade !== undefined) dataUpdate.quantidade = parseInt(quantidade);
    if (isBestseller !== undefined) dataUpdate.isBestseller = isBestseller;
    if (quantidadeVendida !== undefined) dataUpdate.quantidadeVendida = parseInt(quantidadeVendida);
    
    // Validar promoção
    if (emPromocao !== undefined) {
      dataUpdate.emPromocao = emPromocao;
      
      if (emPromocao) {
        if (!precoPromocional) {
          return res.status(400).json({
            success: false,
            message: 'precoPromocional é obrigatório quando emPromocao é true',
          });
        }
        
        const produtoAtual = await prisma.produto.findUnique({
          where: { id: parseInt(id) },
        });
        
        if (!produtoAtual) {
          return res.status(404).json({
            success: false,
            message: 'Produto não encontrado',
          });
        }
        
        const precoBase = preco ? parseFloat(preco) : produtoAtual.preco;
        if (parseFloat(precoPromocional) >= precoBase) {
          return res.status(400).json({
            success: false,
            message: 'Preço promocional deve ser menor que o preço normal',
          });
        }
        
        dataUpdate.precoPromocional = parseFloat(precoPromocional);
      } else {
        dataUpdate.precoPromocional = null;
      }
    }
    
    if (categoriaId) {
      // Verificar se categoria existe
      const categoria = await prisma.categoria.findUnique({
        where: { id: parseInt(categoriaId) },
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada',
        });
      }

      dataUpdate.categoriaId = parseInt(categoriaId);
    }

    const produto = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: dataUpdate,
      include: {
        categoria: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso',
      data: produto,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message,
    });
  }
};

// DELETE - Deletar produto
export const deleteProduto = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.produto.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Produto deletado com sucesso',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao deletar produto',
      error: error.message,
    });
  }
};

// GET - Filtros avançados (preço, categoria, cor, tamanho, busca)
export const filtrarProdutos = async (req, res) => {
  try {
    const { precoMin, precoMax, categoriaId, cor, tamanho, busca } = req.query;

    const filtros = {
      include: { categoria: true },
    };

    const where = {};

    // Filtro por faixa de preço
    if (precoMin || precoMax) {
      where.preco = {};
      if (precoMin) where.preco.gte = parseFloat(precoMin);
      if (precoMax) where.preco.lte = parseFloat(precoMax);
    }

    // Filtro por categoria
    if (categoriaId) {
      where.categoriaId = parseInt(categoriaId);
    }

    // Filtro por cor
    if (cor) {
      where.cor = {
        contains: cor,
        mode: 'insensitive',
      };
    }

    // Filtro por tamanho
    if (tamanho) {
      where.tamanho = {
        contains: tamanho,
        mode: 'insensitive',
      };
    }

    // Filtro por busca geral (nome + descrição)
    if (busca) {
      where.OR = [
        {
          nome: {
            contains: busca,
            mode: 'insensitive',
          },
        },
        {
          descricao: {
            contains: busca,
            mode: 'insensitive',
          },
        },
      ];
    }

    filtros.where = where;

    const produtos = await prisma.produto.findMany(filtros);

    res.status(200).json({
      success: true,
      total: produtos.length,
      data: produtos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao filtrar produtos',
      error: error.message,
    });
  }
};

// GET - Busca global (busca em tudo: nome, descrição, categoria, cor, tamanho)
export const buscaGlobal = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "q" (busca) é obrigatório',
      });
    }

    const termoBusca = q.toLowerCase();

    // Buscar em categorias
    const categorias = await prisma.categoria.findMany({
      where: {
        nome: {
          contains: termoBusca,
          mode: 'insensitive',
        },
      },
      include: {
        produtos: true,
      },
    });

    // Buscar em produtos
    const produtos = await prisma.produto.findMany({
      where: {
        OR: [
          {
            nome: {
              contains: termoBusca,
              mode: 'insensitive',
            },
          },
          {
            descricao: {
              contains: termoBusca,
              mode: 'insensitive',
            },
          },
          {
            cor: {
              contains: termoBusca,
              mode: 'insensitive',
            },
          },
          {
            tamanho: {
              contains: termoBusca,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        categoria: true,
      },
    });

    res.status(200).json({
      success: true,
      resultados: {
        categorias: {
          total: categorias.length,
          dados: categorias,
        },
        produtos: {
          total: produtos.length,
          dados: produtos,
        },
      },
      totalResultados: categorias.length + produtos.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar busca',
      error: error.message,
    });
  }
};
