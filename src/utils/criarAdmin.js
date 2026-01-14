import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Cria o administrador principal se não existir
 * Usa variáveis de ambiente para as credenciais
 */
export const criarAdminPrincipal = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminSenha = process.env.ADMIN_SENHA;
    const adminNome = process.env.ADMIN_NOME || 'Administrador Principal';

    // Verificar se as variáveis de ambiente estão definidas
    if (!adminEmail || !adminSenha) {
      console.log('⚠️  Variáveis ADMIN_EMAIL e ADMIN_SENHA não definidas. Admin principal não será criado.');
      return;
    }

    // Verificar se o admin já existe
    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (adminExistente) {
      console.log('✅ Administrador principal já existe:', adminEmail);
      
      // Atualizar tipo para admin se necessário
      if (adminExistente.tipo !== 'admin') {
        await prisma.usuario.update({
          where: { email: adminEmail },
          data: { tipo: 'admin' },
        });
        console.log('✅ Tipo atualizado para admin');
      }
      
      return;
    }

    // Criar o administrador principal
    const senhaHash = await bcrypt.hash(adminSenha, 10);
    
    const admin = await prisma.usuario.create({
      data: {
        email: adminEmail,
        senha: senhaHash,
        nome: adminNome,
        tipo: 'admin',
      },
      select: {
        id: true,
        email: true,
        nome: true,
        tipo: true,
      },
    });

    console.log('✅ Administrador principal criado com sucesso:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nome: ${admin.nome}`);
    console.log(`   Tipo: ${admin.tipo}`);
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
  } catch (error) {
    console.error('❌ Erro ao criar administrador principal:', error.message);
  }
};
