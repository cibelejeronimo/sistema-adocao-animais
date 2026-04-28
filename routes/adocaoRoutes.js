const express = require('express');
const router = express.Router();
console.log("Tentando carregar o modelo de Adoção...");
const Adocao = require('../models/adocao');
console.log("Modelo carregado com sucesso!");
// Rota para solicitar adoção
router.post('/solicitar', async (req, res) => {
    try {
        const { id_adotante, id_animal } = req.body;
        const novaAdocao = await Adocao.create({
            id_adotante: id_adotante,
            id_animal: id_animal,
            status: 'em analise'
        });
        res.status(201).json({ mensagem: 'Solicitação enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao processar adoção' });
    }
});

// Rota para listar apenas solicitações pendentes de aprovação
router.get('/listar', async (req, res) => {
    try {
        const adocoes = await Adocao.findAll({
            where: { status: 'em analise' },
            include: [
                { model: Adotante },
                { model: Animal }
            ]
        });
        res.json(adocoes);
    } catch (error) {
        console.error('Erro ao buscar adocoes pendentes:', error);
        res.status(500).json({ erro: 'Erro ao buscar' });
    }
});

module.exports = router;