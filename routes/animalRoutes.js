const express = require('express');
const router = express.Router();
const Animal = require('../models/Animal');

// Rota para listar todos os animais (Passo 45 do Diagrama de Atividade)
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

// Rota para o Responsável cadastrar um animal (Passo 1.6 do Diagrama de Sequência)
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

module.exports = router;