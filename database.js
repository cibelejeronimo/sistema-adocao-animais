const { Sequelize } = require('sequelize');

// Cria a conexão com o banco SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

module.exports = sequelize;