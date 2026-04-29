const express = require('express');
const router = express.Router();
const Animal = require('../models/animal');
const adminAuth = require('../middleware/adminAuth');

// Rota para listar todos os animais disponíveis
router.get('/listar', async (req, res) => {
    try {
        const animais = await Animal.findAll({
            where: { status: 'disponivel' }
        });
        res.json(animais);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar animais" });
    }
});

// Rota para o Responsável cadastrar um animal
router.post('/cadastrar', async (req, res) => {
    try {
        const novoAnimal = await Animal.create(req.body);
        res.status(201).json({ 
            mensagem: "Animal cadastrado e divulgado no sistema!", 
            dados: novoAnimal 
        });
    } catch (error) {
        res.status(400).json({ erro: "Erro ao cadastrar animal", detalhes: error.message });
    }
});

// Rota para listar todos os animais para o administrador
router.get('/listar/todos', async (req, res) => {
    try {
        const animais = await Animal.findAll();
        res.json(animais);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar animais" });
    }
});

// Rota para atualizar o status de um animal
router.patch('/status/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const valoresValidos = ['disponivel', 'adotado', 'indisponivel'];

        if (!valoresValidos.includes(status)) {
            return res.status(400).json({ erro: 'Status inválido. Use disponivel, adotado ou indisponivel' });
        }

        const animal = await Animal.findByPk(id);
        if (!animal) {
            return res.status(404).json({ erro: 'Animal não encontrado' });
        }

        animal.status = status;
        await animal.save();

        res.json({ mensagem: 'Status do animal atualizado com sucesso', dados: animal });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar status do animal" });
    }
});

module.exports = router;