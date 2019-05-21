const Discord = require('discord.js')
const Main = require('./main.js');
const bot = new Discord.Client()
const config = require('./config.json')


bot.login(config.token)

bot.on('ready', () => {
    console.log('----- Connected -----')
})

bot.on('message', (message) => {
    if (message.content.substr(0, 2) === '!!') {
        Main.dispatcher(message)
    }
})