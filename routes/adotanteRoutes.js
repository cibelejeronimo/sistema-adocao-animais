const express = require('express');
const router = express.Router();
const Adotante = require('../models/Adotante');

// Rota para cadastrar um novo adotante (Passo 1.2 do Diagrama de Sequência)
router.post('/cadastrar', async (req, res) => {

    console.log(req.body)
    try {
        const novoAdotante = await Adotante.create(req.body);
        res.status(201).json({
            mensagem: "Cadastro confirmado com sucesso!", // Passo 1.5 do Diagrama
            dados: novoAdotante
        });
    } catch (error) {
        res.status(400).json({ erro: "Erro ao realizar cadastro", detalhes: error.message });
    }
});

module.exports = router;