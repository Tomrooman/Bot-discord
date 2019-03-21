const ytdl = require('ytdl-core')

var connectionObj = false
var stream = false
var paused = false

exports.playSong = function (message, url) {
    let voiceChannel = message.guild.channels
        .filter(function (channel) { return channel.type === 'voice' })
        .first()
    voiceChannel
        .join()
        .then(function (connection) {
            connectionObj = connection
            stream = connectionObj.playStream(ytdl(url, { filter: 'audioonly' }))
            stream.setVolume(0.5)
            stream.on('end', () => {
                setTimeout(() => {
                    console.log('Left channel by end')
                    if (connectionObj) {
                        connectionObj.channel.leave()
                    }
                    connectionObj = false
                    stream = false
                }, 2000)
            })
            stream.on('error', (err) => {
                console.log(`Erreur : ${err}`)
            })
        })
};

exports.quit = function() {
    if (connectionObj) {
        console.log('Left channel by quit')
        connectionObj.channel.leave()
        connectionObj = false
        stream = false
    }
    else {
        console.log('Not connected in voice channel')
    }
}

exports.pause = function() {
    if (stream) {
        stream.pause()
        paused = true
    }
}

exports.resume = function() {
    if (paused) {
        stream.resume()
        paused = false
    }
}