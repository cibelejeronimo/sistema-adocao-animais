const { DataTypes } = require('sequelize');
const sequelize = require('../database'); 

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
    comprovante_id_adocao: { type: DataTypes.INTEGER, allowNull: true },
    comprovante_nome_animal: { type: DataTypes.STRING, allowNull: true },
    comprovante_data_visita: { type: DataTypes.DATE, allowNull: true },
    comprovante_local: { type: DataTypes.STRING, allowNull: true },
    situacao: {
        type: DataTypes.ENUM('Ativo', 'Inativo'),
        defaultValue: 'Inativo'
    }
});

module.exports = Adotante;