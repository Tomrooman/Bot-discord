const Player  = require('./player.js')
const Message = require('./message.js')
var test = "tomtom"

exports.dispatcher = function (message) {
    if (message.content.length > 2) {
        let words = message.content.split(' ')
        if (words[0].substr(2, words[0].length - 2) === 'play') {
            if (words[1] && (words[1].includes("http://") || words[1].includes("https://"))) {
                Player.playSongs(message, words[1])
            }
        }
        if (words[0].substr(2, words[0].length - 2) === 'quit') {
            Player.quit(message)
        }
        if (words[0].substr(2, words[0].length - 2) === 'pause') {
            Player.pause(message)
        }
        if (words[0].substr(2, words[0].length - 2) === 'resume') {
            Player.resume(message)
        }
        if (words[0].substr(2, words[0].length - 2) === 'remove') {
            if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
                Message.remove(message, parseInt(words[1]))
            }
        }
        if (words[0].substr(2, words[0].length - 2) === 'clear') {
            Message.remove(message, 'all')
        }
        if (words[0].substr(2, words[0].length - 2) === 'change') {
            console.log('test avant : ', test)
            test = words[1]
            console.log('test : ', test)
        }
    }
    else {
        message.channel.send('Ecrit une commande petit con !')
    }

};

