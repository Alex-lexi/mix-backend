import { Router } from 'express';
import {
  register,
  login,
  obterPerfil,
  atualizarPerfil,
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

export default router;
