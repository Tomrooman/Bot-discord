const ytdl = require('ytdl-core')
const Helper = require('./helper.js')

var connectionsArray = []
var streamsArray = []
var pausedArray = []

exports.playSong = function (message, url) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        voiceChannel
        .join()
        .then(function (connection) {
            connectionsArray[connection.channel.id] = connection
            streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(ytdl(url, { filter: 'audioonly' }))
            streamsArray[connection.channel.id].setVolume(0.5)
            streamsArray[connection.channel.id].on('end', () => {
                setTimeout(() => {
                    console.log('Left channel by end')
<<<<<<< HEAD
                    if (connectionObj) {
                        connectionObj.channel.leave()
                    }
                    connectionObj = false
                    stream = false
=======
                    if (!!connectionsArray[connection.channel.id]) {
                        connectionsArray[connection.channel.id].channel.leave()
                        delete connectionsArray[connection.channel.id]
                        delete streamsArray[connection.channel.id]
                    }
>>>>>>> 82631bc0fa29288eb7e6fdb1640683220d033929
                }, 2000)
            })
            streamsArray[connection.channel.id].on('error', (err) => {
                console.log(`Erreur : ${err}`)
            })
            
        })
    }
    else {
        message.reply('You need to join a voice channel first!');
    }
};

exports.quit = function(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!connectionsArray[userChannel.id]) {
        connectionsArray[userChannel.id].channel.leave()
        delete connectionsArray[userChannel.id]
        delete streamsArray[userChannel.id]
    }
    else {
        message.channel.send('Not connected in voice channel')
    }
}

exports.pause = function(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!streamsArray[userChannel.id]) {
        streamsArray[userChannel.id].pause()
        pausedArray[userChannel.id] = 'onPause'
    }
}

exports.resume = function(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!pausedArray[userChannel.id]) {
        streamsArray[userChannel.id].resume()
        delete pausedArray[userChannel.id]
    }
}