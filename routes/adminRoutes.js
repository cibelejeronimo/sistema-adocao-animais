const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || 'supersecret123';
const tokenOptions = { expiresIn: '8h' };

router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }

    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
        return res.status(400).json({ erro: 'Email já cadastrado.' });
    }

    try {
        const senha_hash = await bcrypt.hash(senha, 10);
        const admin = await Admin.create({ nome, email, senha_hash });
        const token = jwt.sign({ id_admin: admin.id_admin }, jwtSecret, tokenOptions);

        res.status(201).json({
            mensagem: 'Administrador cadastrado com sucesso.',
            token,
            admin: {
                id_admin: admin.id_admin,
                nome: admin.nome,
                email: admin.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao cadastrar administrador.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    try {
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        const validPassword = await bcrypt.compare(senha, admin.senha_hash);
        if (!validPassword) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' });
        }

        const token = jwt.sign({ id_admin: admin.id_admin }, jwtSecret, tokenOptions);
        res.json({
            mensagem: 'Login realizado com sucesso.',
            token,
            admin: {
                id_admin: admin.id_admin,
                nome: admin.nome,
                email: admin.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao realizar login.' });
    }
});

router.get('/me', adminAuth, async (req, res) => {
    res.json({ admin: req.admin });
});

module.exports = router;
