const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // IMPORTANTE: Deve apontar para o seu database.js

const Adotante = sequelize.define('Adotante', {
    id_adotante: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING, unique: true },
    telefone: { type: DataTypes.STRING },
    endereco: { type: DataTypes.STRING },
    situacao: {
        type: DataTypes.ENUM('Ativo', 'Inativo'),
        defaultValue: 'Inativo'
    }
});

module.exports = Adotante;