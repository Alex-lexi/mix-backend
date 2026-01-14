// Validar email
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validar telefone (10-11 dígitos)
export const validarTelefone = (telefone) => {
  const apenasNumeros = telefone.replace(/\D/g, '');
  return apenasNumeros.length >= 10 && apenasNumeros.length <= 11;
};

// Validar preço (positivo)
export const validarPreco = (preco) => {
  return !isNaN(preco) && preco > 0;
};

// Validar quantidade (positiva)
export const validarQuantidade = (quantidade) => {
  return Number.isInteger(quantidade) && quantidade > 0;
};

// Validar nome
export const validarNome = (nome) => {
  return nome && nome.trim().length >= 3;
};

// Validar URL de imagem
export const validarURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
