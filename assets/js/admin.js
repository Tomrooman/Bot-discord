const Helper = require('./helper.js')

function controller(message, words, bot) {
    if (message.author.username + message.author.discriminator === 'Stalyr9246') {
        if (words[1]) {
            if (words[1] === 'message') {
                sendMessageToAllServer(message, words, bot)
            }
            else {
                message.channel.send('> Cette commande admin n\'existe pas')
            }
        }
        else {
            message.channel.send('> Ecrit la commande admin a éxécutée, pour l\'instant juste : message')
        }
    }
    else {
        message.channel.send('> Vous ne faites pas partit des admins')
    }
}

function sendMessageToAllServer(message, words, bot) {
    if (words[2]) {
        delete words[0]
        delete words[1]
        // send message to all first available guild's channel
        bot.guilds.map(guild => {
            if (guild.available) {
                let channel = Helper.getFirstAuthorizedChannel(guild)
                channel.send(words.join(' '))
            }
        })
    }
    else {
        message.channel.send('> Tu n\'as pas écrit de message !')
    }
}

exports.controller = controller