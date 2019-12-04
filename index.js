const Discord = require('discord.js')
const Controller = require('./assets/js/controller.js')
const Level = require('./assets/js/level.js')
const config = require('./config.json')
// const Helper = require('./assets/js/helper.js')
const mongoose = require('mongoose')
const bot = new Discord.Client()

connectToDatabase()

bot.on('ready', () => {
    disconnectBotFromOldChannel()
    console.log('----- Connected ' + config.WHAT + ' -----')
    // send message to all first available guild's channel
    // bot.guilds.map(guild => {
    //     if (guild.available) {
    //         let channel = Helper.getFirstAuthorizedChannel(guild)
    //         channel.send('Je suis en ligne !')
    //     }
    // })
})

bot.on('message', (message) => {
    if (message.content.toLowerCase().startsWith(config.prefix)) {
        Controller.dispatcher(message, config.prefix)
    }
    else if (message.author.id !== config.clientId) {
        Level.addXp(message)
    }
})

// bot.on('messageReactionAdd', (reaction, user) => {
//     console.log('Reaction !')
//     const userChannel = Helper.take_user_voiceChannel(reaction.message.channel)
//     if (reaction.message.content.indexOf('Ex: ' + config.prefix + 'search pl 1') !== -1 && reaction.message.content.indexOf('Ex: ' + config.prefix + 'search p 2') === -1) {
//         console.log('Music search array : ', reaction)
//         console.log('Musique')
//     }
//     else if (reaction.message.content.indexOf('Ex: ' + config.prefix + 'search p 2') !== -1 && reaction.message.content.indexOf('Ex: ' + config.prefix + 'search pl 1') === -1) {
//         console.log('Playlist search array : ', reaction)
//         console.log('playlist')
//     }
//     console.log('user channel : ', userChannel)
//     // console.log('User : ', user)
// })

function connectToDatabase() {
    console.log('Connecting to database ...')
    mongoose.connect('mongodb://localhost/syxbot-database', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: false,
        useFindAndModify: false
    })
    mongoose.connection.once('open', () => {
        console.log('Connected to database !')
        bot.login(config.token)
    })
}

function disconnectBotFromOldChannel() {
    console.log('Disconnecting from all channels ...')
    bot.guilds.map(g => {
        g.channels.map(channel => {
            if (channel.type === 'voice') {
                if (channel.members) {
                    channel.members.map(member => {
                        if (member.user.bot) {
                            channel.join()
                                .then(connection => {
                                    connection.channel.leave()
                                })
                        }
                    })
                }
            }
        })
    })
    console.log('Disconnected from all channels !')
}