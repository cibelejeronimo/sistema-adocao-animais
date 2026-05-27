const express = require('express');
const router = express.Router();
const Animal = require('../models/animal');
const Imagem = require('../models/imagem');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/animais/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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

// Rota para o Responsável cadastrar um animal com upload de imagens
router.post('/cadastrar', adminAuth, upload.array('imagens', 4), async (req, res) => {
    try {
        const {
            nome,
            idade,
            porte,
            vacinas,
            temperamento,
            descricao,
            status = 'disponivel',
            foto: fotoUrl
        } = req.body;

        if (!nome) {
            return res.status(400).json({ erro: 'O nome do animal é obrigatório' });
        }

        if (req.files && req.files.length > 4) {
            return res.status(400).json({ erro: 'No máximo 4 imagens podem ser enviadas' });
        }

        const novoAnimal = await Animal.create({
            nome,
            idade,
            porte,
            vacinas,
            temperamento,
            descricao,
            status
        });

        let capa = fotoUrl || null;
        const imagensCriadas = [];

        if (req.files && req.files.length > 0) {
            for (const [index, file] of req.files.entries()) {
                const caminhoImagem = 'uploads/animais/' + file.filename;
                const imagem = await Imagem.create({
                    id_animal: novoAnimal.id_animal,
                    caminho: caminhoImagem
                });
                imagensCriadas.push(imagem);

                if (index === 0) {
                    capa = caminhoImagem;
                }
            }
        }

        if (capa) {
            novoAnimal.foto = capa;
            await novoAnimal.save();
        }

        res.status(201).json({
            mensagem: 'Animal cadastrado com sucesso e imagens vinculadas',
            dados: novoAnimal,
            imagens: imagensCriadas
        });
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao cadastrar animal', detalhes: error.message });
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

// Rota para editar dados do animal (nome, descrição, foto, status e outros campos)
router.patch('/editar/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, idade, porte, vacinas, temperamento, descricao, status, foto } = req.body;

        const animal = await Animal.findByPk(id);
        if (!animal) {
            return res.status(404).json({ erro: 'Animal não encontrado' });
        }

        if (nome !== undefined) animal.nome = nome;
        if (idade !== undefined) animal.idade = idade;
        if (porte !== undefined) animal.porte = porte;
        if (vacinas !== undefined) animal.vacinas = vacinas;
        if (temperamento !== undefined) animal.temperamento = temperamento;
        if (descricao !== undefined) animal.descricao = descricao;
        if (status !== undefined) animal.status = status;
        if (foto !== undefined) animal.foto = foto;

        await animal.save();

        res.json({ mensagem: 'Animal atualizado com sucesso', dados: animal });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao editar animal', detalhes: error.message });
    }
});

// Rota para upload de múltiplas imagens de um animal
router.post('/upload/:id', upload.array('imagens', 10), async (req, res) => {
    try {
        const { id } = req.params;

        const animal = await Animal.findByPk(id);
        if (!animal) {
            return res.status(404).json({ erro: 'Animal não encontrado' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ erro: 'Nenhuma imagem foi enviada' });
        }

        const imagens = [];
        for (const file of req.files) {
            const novaImagem = await Imagem.create({
                id_animal: id,
                caminho: 'uploads/animais/' + file.filename
            });
            imagens.push(novaImagem);
        }

        res.status(201).json({ 
            mensagem: 'Imagens enviadas com sucesso', 
            imagens: imagens 
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao fazer upload das imagens', detalhes: error.message });
    }
});

// Rota para buscar imagens de um animal
router.get('/imagens/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const imagens = await Imagem.findAll({
            where: { id_animal: id }
        });

        res.json(imagens);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar imagens', detalhes: error.message });
    }
});

// Rota para adicionar imagens a um animal existente
router.post('/imagens/:id', adminAuth, upload.array('imagens', 4), async (req, res) => {
    try {
        const { id } = req.params;

        const animal = await Animal.findByPk(id);
        if (!animal) {
            return res.status(404).json({ erro: 'Animal não encontrado' });
        }

        const totalExistentes = await Imagem.count({ where: { id_animal: id } });
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ erro: 'Nenhuma imagem foi enviada' });
        }

        if (totalExistentes + req.files.length > 4) {
            return res.status(400).json({ erro: 'Você pode ter no máximo 4 imagens por animal' });
        }

        const imagens = [];
        for (const file of req.files) {
            const novaImagem = await Imagem.create({
                id_animal: id,
                caminho: 'uploads/animais/' + file.filename
            });
            imagens.push(novaImagem);
        }

        res.status(201).json({ mensagem: 'Imagens adicionadas com sucesso', imagens });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao adicionar imagens', detalhes: error.message });
    }
});

// Rota para remover uma imagem do animal
router.delete('/imagem/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const imagem = await Imagem.findByPk(id);
        if (!imagem) {
            return res.status(404).json({ erro: 'Imagem não encontrada' });
        }

        const caminhoArquivo = `public/${imagem.caminho}`;
        if (fs.existsSync(caminhoArquivo)) {
            fs.unlinkSync(caminhoArquivo);
        }

        await imagem.destroy();

        res.json({ mensagem: 'Imagem removida com sucesso' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao remover imagem', detalhes: error.message });
    }
});

// Rota para definir imagem de capa a partir de imagem existente
router.patch('/imagem/capa/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const imagem = await Imagem.findByPk(id);
        if (!imagem) {
            return res.status(404).json({ erro: 'Imagem não encontrada' });
        }

        const animal = await Animal.findByPk(imagem.id_animal);
        if (!animal) {
            return res.status(404).json({ erro: 'Animal não encontrado' });
        }

        animal.foto = imagem.caminho;
        await animal.save();

        res.json({ mensagem: 'Imagem de capa atualizada com sucesso', dados: animal });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao definir imagem de capa', detalhes: error.message });
    }
});

module.exports = router;