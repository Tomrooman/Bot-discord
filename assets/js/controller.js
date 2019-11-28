const Player = require('./player.js')
const Message = require('./message.js')
const Level = require('./level.js')

function dispatcher(message, prefixLength) {
    if (message.content.length > prefixLength) {
        const words = message.content.split(' ')
        if (words[0].startsWith('play', prefixLength)) {
            if (words[1] && (words[1].includes('http://') || words[1].includes('https://'))) {
                Player.playSongs(message, words[0], words[1])
            }
            else {
                message.reply('Vous devez entrer une URL valide !')
            }
        }
        else if (words[0].startsWith('quit', prefixLength)) {
            Player.quit(message)
        }
        else if (words[0].startsWith('pause', prefixLength)) {
            Player.pause(message)
        }
        else if (words[0].startsWith('resume', prefixLength)) {
            Player.resume(message)
        }
        else if (words[0].startsWith('next', prefixLength)) {
            Player.next(message)
        }
        else if (words[0].startsWith('queued', prefixLength)) {
            Player.showQueuedSongs(message)
        }
        else if (words[0].startsWith('radio', prefixLength)) {
            Player.radio(message, words)
        }
        else if (words[0].startsWith('remove', prefixLength)) {
            if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
                Message.remove(message, parseInt(words[1]))
            }
        }
        else if (words[0].startsWith('clear', prefixLength)) {
            Message.remove(message, 'all')
        }
        else if (words[0].startsWith('rank', prefixLength)) {
            Level.rank(message)
        }
        else {
            message.reply('cette commande n\'existe pas !')
        }
    }
    else {
        message.reply('vous devez écrire une commande !')
    }

}

exports.dispatcher = dispatcher