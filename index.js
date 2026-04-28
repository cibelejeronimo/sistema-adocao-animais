const express = require('express');
const sequelize = require('./database'); 
const path = require('path');

// --- CORREÇÃO AQUI: Importando com nomes minúsculos para bater com seus arquivos ---
const Adotante = require('./models/adotante');
const Animal = require('./models/animal');
const Adocao = require('./models/adocao');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Importa e Ativa as Rotas
const adotanteRoutes = require('./routes/adotanteRoutes.js');
app.use('/adotantes', adotanteRoutes);

const animalRoutes = require('./routes/animalRoutes.js');
app.use('/animais', animalRoutes);

const adocaoRoutes = require('./routes/adocaoRoutes.js');
app.use('/adocoes', adocaoRoutes);

// Função para iniciar o servidor
async function startServer() {
    try {
        // Sincroniza o banco de dados
        await sequelize.sync(); 
        
        console.log('---');
        console.log('✅ Banco de dados conectado com sucesso!');
        
        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log('👋 Pressione Ctrl + C para parar');
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar o servidor:', error);
    }
}

startServer();