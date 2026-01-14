import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validarEmail } from '../utils/validacoes.js';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';

// POST - Registrar novo usuário
export const register = async (req, res) => {
  try {
    const { email, senha, nome, tipo, telefone } = req.body;

    // Validações obrigatórias
    if (!email || !senha || !nome) {
      return res.status(400).json({
        success: false,
        message: 'email, senha e nome são obrigatórios',
      });
    }

    // Verificar se está tentando criar um vendedor
    // Apenas admin pode criar vendedores
    if (tipo === 'vendedor') {
      // Verificar se há usuário autenticado
      const usuarioAutenticado = req.usuario;
      
      if (!usuarioAutenticado || usuarioAutenticado.tipo !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Apenas o administrador principal pode criar contas de vendedor',
        });
      }
    }

    // Validar email
    if (!validarEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
      });
    }

    // Validar tamanho da senha
    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres',
      });
    }

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado',
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    // Admin só pode ser criado via variável de ambiente
    const tipoUsuario = tipo === 'vendedor' ? 'vendedor' : 'cliente';
    
    const usuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaHash,
        nome,
        tipo: tipoUsuario,
        telefone: telefone || null,
      },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        telefone: true,
      },
    });

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      token,
      usuario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message,
    });
  }
};

// POST - Login
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'email e senha são obrigatórios',
      });
    }

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos',
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message,
    });
  }
};

// GET - Obter perfil do usuário logado
export const obterPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        telefone: true,
        createdAt: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil',
      error: error.message,
    });
  }
};

// PUT - Atualizar perfil do usuário
export const atualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nome, telefone } = req.body;

    const dataAtualizar = {};
    if (nome) dataAtualizar.nome = nome;
    if (telefone) dataAtualizar.telefone = telefone;

    if (Object.keys(dataAtualizar).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar',
      });
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: dataAtualizar,
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
        telefone: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: usuario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message,
    });
  }
};
