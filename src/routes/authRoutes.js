import { Router } from 'express';
import {
  register,
  login,
  obterPerfil,
  atualizarPerfil,
  listarVendedores,
  deletarVendedor,
} from '../controllers/authController.js';
import {
  verificarToken,
  verificarAdmin,
  verificarTokenOpcional,
} from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     description: |
 *       Cria uma nova conta de usuário. 
 *       - Clientes podem se registrar livremente
 *       - Vendedores só podem ser criados pelo administrador principal
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               senha:
 *                 type: string
 *                 minLength: 6
 *                 example: senha123456
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               tipo:
 *                 type: string
 *                 enum: [vendedor, cliente]
 *                 example: cliente
 *                 description: Use 'vendedor' apenas se você for admin (requer autenticação)
 *               telefone:
 *                 type: string
 *                 example: "11987654321"
 *             required: [email, senha, nome]
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Email inválido ou já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Tentativa de criar vendedor sem ser admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Apenas o administrador principal pode criar contas de vendedor
 */
router.post('/register', verificarTokenOpcional, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Fazer login
 *     description: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@example.com
 *               senha:
 *                 type: string
 *                 example: senha123456
 *             required: [email, senha]
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Email ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     description: Retorna os dados do perfil do usuário logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/perfil', verificarToken, obterPerfil);

/**
 * @swagger
 * /api/auth/perfil:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     description: Atualiza nome e/ou telefone do usuário autenticado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva Atualizado
 *               telefone:
 *                 type: string
 *                 example: "11999999999"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/perfil', verificarToken, atualizarPerfil);

/**
 * @swagger
 * /api/auth/vendedores:
 *   get:
 *     summary: Listar todos os vendedores
 *     description: |
 *       Retorna uma lista de todos os vendedores cadastrados no sistema.
 *       **Acesso restrito:** Apenas o administrador principal pode acessar esta rota.
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vendedores obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: number
 *                   example: 3
 *                   description: Número total de vendedores cadastrados
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 2
 *                       email:
 *                         type: string
 *                         example: vendedor@loja.com
 *                       nome:
 *                         type: string
 *                         example: Maria Vendedora
 *                       telefone:
 *                         type: string
 *                         nullable: true
 *                         example: "11987654321"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-15T10:30:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-15T10:30:00.000Z"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token não fornecido
 *       403:
 *         description: Acesso negado - Usuário não é administrador
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Acesso negado. Apenas o administrador principal pode executar esta ação
 *       500:
 *         description: Erro no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/vendedores', verificarToken, verificarAdmin, listarVendedores);

/**
 * @swagger
 * /api/auth/vendedores/{id}:
 *   delete:
 *     summary: Deletar um vendedor
 *     description: |
 *       Deleta um usuário do tipo **vendedor** a partir do seu ID.
 *       **Acesso restrito:** Apenas o administrador principal pode executar esta ação.
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vendedor a ser deletado
 *     responses:
 *       200:
 *         description: Vendedor deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vendedor deletado com sucesso
 *       400:
 *         description: Usuário não é do tipo vendedor
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado. Apenas o administrador principal pode executar esta ação
 *       404:
 *         description: Vendedor não encontrado
 */
router.delete('/vendedores/:id', verificarToken, verificarAdmin, deletarVendedor);

export default router;
