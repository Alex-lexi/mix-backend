import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';

// Middleware para verificar token JWT
export const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido',
        code: 'TOKEN_NAO_FORNECIDO',
      });
    }

    const decodificado = jwt.verify(token, SECRET_KEY);
    req.usuario = decodificado;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      code: 'TOKEN_INVALIDO_OU_EXPIRADO',
      error: error.message,
    });
  }
};

// Middleware para verificar token de forma opcional (não bloqueia se não houver token)
export const verificarTokenOpcional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decodificado = jwt.verify(token, SECRET_KEY);
        req.usuario = decodificado;
      } catch (error) {
        // Token inválido, mas não bloqueia a requisição
        req.usuario = null;
      }
    } else {
      req.usuario = null;
    }
    
    next();
  } catch (error) {
    req.usuario = null;
    next();
  }
};

// Middleware para verificar se é vendedor
export const verificarVendedor = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'vendedor') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas vendedores podem executar esta ação',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar tipo de usuário',
      error: error.message,
    });
  }
};

// Middleware para verificar se é cliente
export const verificarCliente = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'cliente') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas clientes podem executar esta ação',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar tipo de usuário',
      error: error.message,
    });
  }
};

// Middleware para verificar se é administrador principal
export const verificarAdmin = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas o administrador principal pode executar esta ação',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar tipo de usuário',
      error: error.message,
    });
  }
};

// Middleware para verificar se é vendedor ou administrador
export const verificarVendedorOuAdmin = (req, res, next) => {
  try {
    if (req.usuario.tipo !== 'vendedor' && req.usuario.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas vendedores e administradores podem executar esta ação',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Erro ao verificar tipo de usuário',
      error: error.message,
    });
  }
};
