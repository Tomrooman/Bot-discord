const Player = require('./player.js')
const Message = require('./message.js')
const Level = require('./level.js')

function dispatcher(message, prefixLength) {
    const words = message.content.substr(prefixLength, message.content.length - prefixLength).split(' ')
    const command = words[0]
    if (message.content.length > prefixLength) {
        if (command === 'play' || command === 'playlist') {
            if (words[1] && (words[1].includes('http://') || words[1].includes('https://'))) {
                Player.playSongs(message, words[0], words[1])
            }
            else if (words[1] && words[1] === 'list') {
                Player.showQueuedSongs(message)
            }
            else {
                message.channel.send('Vous devez entrer une URL valide !')
            }
        }
        else if (command === 'quit') {
            Player.quit(message)
        }
        else if (command === 'pause') {
            Player.pause(message)
        }
        else if (command === 'resume') {
            Player.resume(message)
        }
        else if (command === 'next') {
            Player.next(message)
        }
        else if (command === 'radio') {
            Player.radio(message, words)
        }
        else if (command === 'remove') {
            if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
                Message.remove(message, parseInt(words[1]))
            }
        }
        else if (command === 'clear') {
            Message.remove(message, 'all')
        }
        else if (command === 'rank') {
            Level.rank(message)
        }
        else {
            message.channel.send('Cette commande n\'existe pas !')
        }
    }
    else {
        message.channel.send('Vous n\'avez pas écrit de commande !')
    }

}

exports.dispatcher = dispatcher