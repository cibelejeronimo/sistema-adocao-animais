const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Imagem = sequelize.define('Imagem', {
    id_imagem: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    id_animal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Animals', // Note: Sequelize pluralizes table names
            key: 'id_animal'
        }
    },
    caminho: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Imagem;