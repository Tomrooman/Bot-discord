const Player = require('./player.js')
const Message = require('./message.js')
const Level = require('./level.js')

function dispatcher(message) {
    if (message.content.length > 2) {
        let words = message.content.split(' ')
        if (words[0].startsWith('play', 2) || words[0].startsWith('playlist', 2)) {
            if (words[1] && (words[1].includes("http://") || words[1].includes("https://"))) {
                Player.playSongs(message, words[0], words[1])
            }
            else {
                message.reply('Vous devez entrer une URL valide !')
            }
        }
        else if (words[0].startsWith('quit', 2)) {
            Player.quit(message)
        }
        else if (words[0].startsWith('pause', 2)) {
            Player.pause(message)
        }
        else if (words[0].startsWith('resume', 2)) {
            Player.resume(message)
        }
        else if (words[0].startsWith('next', 2)) {
            Player.next(message)
        }
        else if (words[0].startsWith('radio', 2)) {
            Player.radio(message, words)
        }
        else if (words[0].startsWith('remove', 2)) {
            if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
                Message.remove(message, parseInt(words[1]))
            }
        }
        else if (words[0].startsWith('clear', 2)) {
            Message.remove(message, 'all')
        }
        else if (words[0].startsWith('rank', 2)) {
            Level.rank(message)
        }
        else {
            message.reply("cette commande n'existe pas !")
        }
    }
    else {
        //message.channel.send('You must write a command !')
        message.reply('Vous devez écrire une commande !')
    }

};

exports.dispatcher = dispatcher