const Discord = require('discord.js')
const Controller = require('./assets/js/controller.js')
const Level = require('./assets/js/level.js')
const config = require('./config.json')
const Helper = require('./assets/js/helper.js')
const Player = require('./assets/js/player.js')
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
    if (message.content.toLowerCase().startsWith(config.prefix) && message.content.indexOf('!!!') === -1) {
        Controller.dispatcher(message, config.prefix)
    }
    else if (message.author.id !== config.clientId) {
        Level.addXp(message)
    }
})

bot.on('messageReactionAdd', (reaction, user) => {
    if (!user.bot) {
        const playlistExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search pl 1') !== -1
        const videoExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search p 2') !== -1
        if (playlistExist || videoExist) {
            let selection = 0
            if (reaction.emoji.name === '1️⃣') {
                selection = 1
            }
            if (reaction.emoji.name === '2️⃣') {
                selection = 2
            }
            if (reaction.emoji.name === '3️⃣') {
                selection = 3
            }
            if (reaction.emoji.name === '4️⃣') {
                selection = 4
            }
            if (reaction.emoji.name === '5️⃣') {
                selection = 5
            }
            if (playlistExist && !videoExist) {
                if (reaction.emoji.name === '⏩') {
                    const userChannel = Helper.take_user_voiceChannel_by_reaction(reaction.message, user)
                    if (userChannel) {
                        Player.youtubeResearch(reaction.message, null, 'playlist', false, [true, user])
                    }
                    else {
                        reaction.message.channel.send('Vous devez être connecté dans un salon !')
                    }
                }
                else {
                    Player.selectSongInSearchList(reaction.message, selection, 'playlist', [true, user])
                }
            }
            else if (videoExist && !playlistExist) {
                if (reaction.emoji.name === '⏩') {
                    const userChannel = Helper.take_user_voiceChannel_by_reaction(reaction.message, user)
                    if (userChannel) {
                        Player.youtubeResearch(reaction.message, null, 'video', false, [true, user])
                    }
                    else {
                        reaction.message.channel.send('Vous devez être connecté dans un salon !')
                    }
                }
                else {
                    Player.selectSongInSearchList(reaction.message, selection, 'musique', [true, user])
                }
            }
        }
    }
})

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

process.on('SIGINT', () => {
    // close connections, clear cache, etc
    process.exit(0);
});