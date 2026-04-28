const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Adotante = require('./adotante'); 
const Animal = require('./animal');    

const Adocao = sequelize.define('Adocao', {
    id_adocao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    data_visita: {
        type: DataTypes.DATE,
        allowNull: true 
    },
    status: {
        type: DataTypes.ENUM('em analise', 'reprovado', 'finalizado'),
        defaultValue: 'em analise'
    }
});

// Relacionamentos
Adocao.belongsTo(Adotante, { foreignKey: 'id_adotante' });
Adocao.belongsTo(Animal, { foreignKey: 'id_animal' });

module.exports = Adocao;