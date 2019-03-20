const Discord = require('discord.js')
const Main = require('./main.js');
const bot = new Discord.Client()


bot.login('NTU3NTg5ODM5NTg3OTY2OTc3.D3KgUA.Hstysro-edujF5PxjKCfvufpwbI')

bot.on('ready', () => {
    bot.user.setActivity('Stalyr le boss')
    console.log(`Logged in as ${bot.user.tag}!`);
})

bot.on('message', (message) => {
    if (message.content.substr(0, 2) === '!!') {
        Main.dispatcher(message)
    }
})