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
        const { status, data_visita } = req.body;
        const valoresValidos = ['finalizado', 'reprovado'];

        if (!valoresValidos.includes(status)) {
            return res.status(400).json({ erro: 'Status inválido. Use finalizado ou reprovado.' });
        }

        const adocao = await Adocao.findByPk(id);
        if (!adocao) {
            return res.status(404).json({ erro: 'Solicitação de adoção não encontrada' });
        }

        if (status === 'finalizado' && !data_visita) {
            return res.status(400).json({ erro: 'Defina a data da visita presencial no canil local ao finalizar a adoção.' });
        }

        adocao.status = status;
        if (data_visita) {
            adocao.data_visita = new Date(data_visita);
        }
        await adocao.save();

        let animal = null;
        if (status === 'finalizado') {
            animal = await Animal.findByPk(adocao.id_animal);
            if (animal) {
                animal.status = 'adotado';
                await animal.save();
            }

            const adotante = await Adotante.findByPk(adocao.id_adotante);
            if (adotante) {
                adotante.comprovante_id_adocao = adocao.id_adocao;
                adotante.comprovante_nome_animal = animal?.nome || null;
                adotante.comprovante_data_visita = adocao.data_visita;
                adotante.comprovante_local = 'Canil Local';
                await adotante.save();
            }
        }

        const adocaoCompleta = await Adocao.findByPk(id, {
            include: [Adotante, Animal]
        });

        return res.json({
            mensagem: 'Status da solicitação atualizado com sucesso',
            dados: adocaoCompleta,
            comprovante: {
                id_adocao: adocaoCompleta.id_adocao,
                nome_adotante: adocaoCompleta.Adotante?.nome,
                nome_animal: adocaoCompleta.Animal?.nome,
                data_visita: adocaoCompleta.data_visita,
                status: adocaoCompleta.status,
                local_visita: 'Canil Local'
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar status de adoção:', error);
        res.status(500).json({ erro: 'Erro ao atualizar status' });
    }
});

router.get('/comprovante/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const adocao = await Adocao.findByPk(id, {
            include: [Adotante, Animal]
        });

        if (!adocao) {
            return res.status(404).json({ erro: 'Solicitação de adoção não encontrada' });
        }

        if (adocao.status !== 'finalizado') {
            return res.status(400).json({ erro: 'Comprovante disponível apenas para adoções finalizadas.' });
        }

        res.json({
            comprovante: {
                id_adocao: adocao.id_adocao,
                nome_adotante: adocao.Adotante?.nome,
                email_adotante: adocao.Adotante?.email,
                nome_animal: adocao.Animal?.nome,
                data_visita: adocao.data_visita,
                status: adocao.status,
                local_visita: 'Canil Local'
            }
        });
    } catch (error) {
        console.error('Erro ao buscar comprovante de adoção:', error);
        res.status(500).json({ erro: 'Erro ao buscar comprovante' });
    }
});

module.exports = router;