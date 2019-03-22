const Player  = require('./player.js')
const Message = require('./message.js')

exports.dispatcher = function (message) {
    if (message.content.length > 2) {
        let words = message.content.split(' ')
        if (words[0].substr(2, words[0].length - 2) === 'play') {
            if (words[1]) {
                Player.playSong(message, words[1])
            }
        }
        if (words[0].substr(2, words[0].length - 2) === 'quit') {
            Player.quit()
        }
        if (words[0].substr(2, words[0].length - 2) === 'pause') {
            Player.pause()
        }
        if (words[0].substr(2, words[0].length - 2) === 'resume') {
            Player.resume()
        }
        if (words[0].substr(2, words[0].length - 2) === 'remove') {
            if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
                Message.remove(message, parseInt(words[1]))
            }
        }
        if (words[0].substr(2, words[0].length - 2) === 'clear') {
            Message.remove(message, 'all')
        }
    }
    else {
        message.channel.send('Ecrit une commande petit con !')
    }

};

