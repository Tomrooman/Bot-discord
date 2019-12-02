const Player = require('./player.js')
const Message = require('./message.js')
const Level = require('./level.js')
const Helper = require('./helper.js')

function dispatcher(message, prefix) {
    const words = message.content.substr(prefix.length, message.content.length - prefix.length).split(' ')
    const command = words[0].toLowerCase()
    if (message.content.length > prefix.length) {
        if (command === 'play' || command === 'playlist' || command === 'p' || command === 'pl') {
            if (words[1] === 'list') {
                Player.showQueuedSongs(message)
            }
            else if (Number.isFinite(parseInt(words[1]))) {
                Player.getSongInPlaylist(message, parseInt(words[1]))
            }
            else {
                Player.playSongs(message, command, words)
            }
        }
        else if (command === 'search') {
            if (Number.isFinite(parseInt(words[1]))) {
                Player.selectSongInSearchList(message, parseInt(words[1]))
            }
            else {
                Player.getSongInSearchList(message)
            }
        }
        else if (command === 'loop') {
            Player.toggleLoop(message)
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
            else {
                message.channel.send('Vous devez écrire le nombre de messages que vous voulez supprimé.')
            }
        }
        else if (command === 'clear') {
            Message.remove(message, 'all')
        }
        else if (command === 'grade') {
            Level.grade(message)
        }
        else if (command === 'help') {
            if (words[1]) {
                if (Helper.availableCommand().map(c => c.name === words[1].toLowerCase())) {
                    Helper.getCommandInfos(message, words[1].toLowerCase())
                }
                else {
                    message.channel.send('Veuillez écrire une commande existante.')
                }

            }
            else {
                Helper.showCommandlist(message)
            }
        }
        else {
            message.channel.send('Cette commande n\'existe pas ! \n Tapez **' + prefix + 'help** pour afficher la liste des commandes.')
        }
    }
    else {
        message.channel.send('Vous n\'avez pas écrit de commande !')
    }

}

exports.dispatcher = dispatcher