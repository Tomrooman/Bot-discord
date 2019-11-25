const Discord = require('discord.js')
const Controller = require('./controller.js')
const Level = require('./level.js')
const config = require('./config.json')
const helper = require('./helper.js')

const bot = new Discord.Client()

global.dbConnection = false


bot.login(config.token)

bot.on('ready', () => {
    console.log('----- Connected -----')

    console.log('Connecting to database ...')
    let MongoClient = require('mongodb').MongoClient
    var url = "mongodb://localhost:27017/syxbot-database"

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        dbConnection = db.db('syxbot-database')
        console.log("Connected to database !")
    });

    // Send a message when online
    // bot.guilds.map(guild => {
    //     if (guild.available) {
    //         let channel = helper.getFirstAuthorizedChannel(guild)
    //         channel.send('Je suis en ligne !')
    //     }
    // })
})

bot.on('message', (message) => {
    if (message.content.substr(0, 2) === '!!') {
        //console.log('author id: ', message.author.id)
        Controller.dispatcher(message)
    }
    else {
        if (!!dbConnection && message.author.id !== config.clientId) {
            //console.log('author id: ', message.author.id)
            Level.addXp(message)
        }
    }
})