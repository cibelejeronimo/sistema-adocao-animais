const express = require('express');
const router = express.Router();
console.log("Tentando carregar o modelo de Adoção...");
const Adocao = require('../models/adocao');
const Adotante = require('../models/adotante');
const Animal = require('../models/animal');
const adminAuth = require('../middleware/adminAuth');
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
router.get('/listar', adminAuth, async (req, res) => {
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

router.patch('/decidir/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const valoresValidos = ['finalizado', 'reprovado'];

        if (!valoresValidos.includes(status)) {
            return res.status(400).json({ erro: 'Status inválido. Use finalizado ou reprovado.' });
        }

        const adocao = await Adocao.findByPk(id);
        if (!adocao) {
            return res.status(404).json({ erro: 'Solicitação de adoção não encontrada' });
        }

        adocao.status = status;
        await adocao.save();

        if (status === 'finalizado') {
            const animal = await Animal.findByPk(adocao.id_animal);
            if (animal) {
                animal.status = 'adotado';
                await animal.save();
            }
        }

        res.json({ mensagem: 'Status da solicitação atualizado com sucesso', dados: adocao });
    } catch (error) {
        console.error('Erro ao atualizar status de adoção:', error);
        res.status(500).json({ erro: 'Erro ao atualizar status' });
    }
});

module.exports = router;