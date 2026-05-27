const express = require('express');
const router = express.Router();
const Adotante = require('../models/adotante');
const adminAuth = require('../middleware/adminAuth');

// Rota para cadastrar um novo adotante (Passo 1.2 do Diagrama de Sequência)
router.post('/cadastrar', async (req, res) => {

    const userByCPF = await Adotante.findOne({ where: { cpf: req.body.cpf } });
    if (userByCPF) {
        return res.status(400).json({ erro: "CPF já cadastrado" });
    }

    try {
        const novoAdotante = await Adotante.create({
            ...req.body,
            situacao: 'Inativo'
        });
        res.status(201).json({
            mensagem: "Cadastro confirmado com sucesso!",
            dados: novoAdotante
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ erro: "Erro ao realizar cadastro", detalhes: error.message });
    }
});

// Rota para ativar/adicionar situacao Ativo ao adotante
router.get('/listar', adminAuth, async (req, res) => {
    try {
        const adotantes = await Adotante.findAll();
        res.json(adotantes);
    } catch (error) {
        console.error('Erro ao buscar adotantes:', error);
        res.status(500).json({ erro: 'Erro ao buscar adotantes' });
    }
});

router.patch('/status/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { situacao } = req.body;
        const valoresValidos = ['Ativo', 'Inativo'];

        if (!valoresValidos.includes(situacao)) {
            return res.status(400).json({ erro: 'Status inválido. Use Ativo ou Inativo' });
        }

        const adotante = await Adotante.findByPk(id);
        if (!adotante) {
            return res.status(404).json({ erro: 'Adotante não encontrado' });
        }

        adotante.situacao = situacao;
        await adotante.save();

        res.json({ mensagem: 'Status do adotante atualizado com sucesso', dados: adotante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao atualizar status do adotante' });
    }
});

router.patch('/ativar/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adotante = await Adotante.findByPk(id);

        if (!adotante) {
            return res.status(404).json({ erro: 'Adotante não encontrado' });
        }

        adotante.situacao = 'Ativo';
        await adotante.save();

        res.json({ mensagem: 'Adotante ativado com sucesso', dados: adotante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao ativar adotante' });
    }
});

router.get('/perfil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const adotante = await Adotante.findByPk(id);

        if (!adotante) {
            return res.status(404).json({ erro: 'Adotante não encontrado' });
        }

        res.json({ dados: adotante });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar perfil do adotante' });
    }
});

module.exports = router;