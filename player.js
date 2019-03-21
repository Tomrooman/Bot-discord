const ytdl = require('ytdl-core')

var connectionObj = false

exports.playSong = function (message, url) {
    let voiceChannel = message.guild.channels
        .filter(function (channel) { return channel.type === 'voice' })
        .first()
    voiceChannel
        .join()
        .then(function (connection) {
            connectionObj = connection
            let stream = connectionObj.playStream(ytdl(url, { filter: 'audioonly' }))
            // stream.pause()
            // stream.resume()
            stream.setVolume(0.5)
            stream.on('end', () => {
                console.log('Left channel by end')
                connectionObj.channel.leave()
                connectionObj = false
            })
            stream.on('error', (err) => {
                console.log(`Erreur : ${err}`)
            })
        })
};

exports.stop = function() {
    if (connectionObj) {
        console.log('Left channel by stop')
        connectionObj.channel.leave()
        connectionObj = false
    }
    else {
        console.log('Not connected in voice channel')
    }
}