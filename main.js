const Player = require('./player.js')

exports.dispatcher = function (message) {
    if (message.content.length > 2) {
        let words = message.content.split(' ')
        if (words[0].substr(2, words[0].length - 2) === 'play') {
            if (words[1]) {
                Player.playSong(message, words[1])
            }
        }
        if (words[0].substr(2, words[0].length - 2) === 'stop') {
            Player.stop()
        }
    }
    else {
        message.channel.send('Ecrit une commande petit con')
    }

};

