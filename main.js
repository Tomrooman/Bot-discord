const ytdl = require('ytdl-core')
var connectionObj = false
exports.dispatcher = function (message) {
    if (message.content.length > 2) {
        let words = message.content.split(' ')
        if (words[0].substr(2, words[0].length - 2) === 'play') {
            if (words[1]) {
                playSong(message, words[1])
            }
        }
        if (words[0].substr(2, words[0].length - 2) === 'stop') {
            if (connectionObj) {
                console.log('Left channel by stop')
                connectionObj.channel.leave()
                connectionObj = false
            }
            else {
                console.log('Not connected in voice channel')
            }
        }
    }
    else {
        message.channel.send('Ecrit une commande petit con')
    }

};

var playSong = function (message, url) {
    let voiceChannel = message.guild.channels
        .filter(function (channel) { return channel.type === 'voice' })
        .first()
    voiceChannel
        .join()
        .then(function (connection) {
            connectionObj = connection
            let stream = connectionObj.playFile(ytdl(url, { filter: 'audioonly' }))
            // stream.pause()
            // stream.resume()
            stream.setVolume(0.5)
            stream.on('finish', () => {
                console.log('Left channel by end')
                connectionObj.channel.leave()
                connectionObj = false

            })
            stream.on('error', (err) => {
                console.log(`Erreur : ${err}`)
            })
        })
};