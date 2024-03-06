const { Sequelize } = require('sequelize')
const connection = new Sequelize('TEST', 'mi', 'miadmin', {
    host: '192.168.5.10',
    dialect: 'mssql',
    dialectOptions:{
        options:{
            encrypt:true
        }
    },
    logging: false
})

module.exports = connection