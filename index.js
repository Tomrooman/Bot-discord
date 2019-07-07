const Discord = require('discord.js')
const Main = require('./main.js')
const Level = require('./level.js')
const bot = new Discord.Client()
const config = require('./config.json')

global.dbConnection = false


bot.login(config.token)

bot.on('ready', () => {
    console.log('----- Connected -----')
})

bot.on('message', (message) => {
    if (!!!dbConnection && message.author.id !== config.clientId) {
        console.log('try to connect to database')
        let MongoClient = require('mongodb').MongoClient
        var url = "mongodb://localhost:27017/bot-discord"

        MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            dbConnection = db.db('bot-discord')
            console.log("Connected to database !")
            if (message.content.substr(0, 2) === '!!') {
                Main.dispatcher(message)
            }
            else {
                Level.addXp(message)
            }
        });
    }
    else if (message.content.substr(0, 2) === '!!') {
        Main.dispatcher(message)
    }
    else {
        if (!!dbConnection && message.author.id !== config.clientId) {
            Level.addXp(message)
        }
    }
})