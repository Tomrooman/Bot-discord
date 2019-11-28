const Discord = require('discord.js')
const Controller = require('./assets/js/controller.js')
const Level = require('./assets/js/level.js')
const config = require('./config.json')
// const helper = require('./assets/js/helper.js')
const MongoClient = require('mongodb').MongoClient

const bot = new Discord.Client()

global.dbConnection = false


bot.login(config.token)

bot.on('ready', () => {
    console.log('----- Connected ' + config.WHAT + ' -----')

    console.log('Connecting to database ...')

    const url = 'mongodb://localhost:27017/syxbot-database'

    MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function (err, db) {
        if (err) throw err;
        global.dbConnection = db.db('syxbot-database')
        console.log('Connected to database !')
    });

    // send message to all first available guild's channel
    // bot.guilds.map(guild => {
    //     if (guild.available) {
    //         let channel = helper.getFirstAuthorizedChannel(guild)
    //         channel.send('Je suis en ligne !')
    //     }
    // })
})

bot.on('message', (message) => {
    if (message.content.startsWith(config.prefix)) {
        // console.log('author id: ', message.author.id)
        Controller.dispatcher(message, config.prefix.length)
    }
    else if (message.author.id !== config.clientId) {
        // console.log('author id: ', message.author.id)
        Level.addXp(message)
    }
})