const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Animal = sequelize.define('Animal', {
    id_animal: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: { type: DataTypes.STRING, allowNull: false },
    idade: { type: DataTypes.STRING },
    descricao: { type: DataTypes.TEXT },
    foto: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'disponivel' }
});

module.exports = Animal;