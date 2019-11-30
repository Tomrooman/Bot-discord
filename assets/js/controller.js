const Player = require('./player.js')
const Message = require('./message.js')
// const Level = require('./level.js')

function dispatcher(message, prefixLength) {
    const words = message.content.substr(prefixLength, message.content.length - prefixLength).split(' ')
    const command = words[0].toLowerCase()
    if (message.content.length > prefixLength) {
        if (command === 'play' || command === 'playlist' || command === 'p' || command === 'pl') {
            if (words[1] === 'list') {
                Player.showQueuedSongs(message)
            }
            else {
                Player.playSongs(message, command, words[1])
            }
        }
        else if (Number.isFinite(parseInt(command))) {
            Player.getSongInPlaylist(message, parseInt(command))
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
        // else if (command === 'rank') {
        //     Level.rank(message)
        // }
        else {
            message.channel.send('Cette commande n\'existe pas !')
        }
    }
    else {
        message.channel.send('Vous n\'avez pas écrit de commande !')
    }

}

exports.dispatcher = dispatcher