const ytdl = require('ytdl-core')
const Helper = require('./helper.js')

var connectionsArray = []
var streamsArray = []
var pausedArray = []
var playlistArray = []

exports.playSongs = function (message, url) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        if (!!!streamsArray[voiceChannel.id]) {
            voiceChannel
                .join()
                .then(function (connection) {
                    playSong(connection, url)

                })
        }
    }
    else {
        message.reply('You need to join a voice channel first!');
    }
};

exports.playSong = function (connection, url, bypass = false) {
    let check = bypass === false ? bypass : true
    if (checkURL(connection, url, bypass)) {
        connectionsArray[connection.channel.id] = connection
        streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(ytdl(playlistArray[connection.channel.id][0], { filter: 'audioonly' }))
        streamsArray[connection.channel.id].setVolume(0.5)
        streamsArray[connection.channel.id].on('end', () => {
            setTimeout(() => {
                console.log('Left channel by end')
                if (!!connectionsArray[connection.channel.id] && !!!playlistArray[connection.channel.id]) {
                    connectionsArray[connection.channel.id].channel.leave()
                    delete connectionsArray[connection.channel.id]
                    delete streamsArray[connection.channel.id]
                }
                else {
                    if (!!playlistArray[connection.channel.id]) {
                        delete playlistArray[connection.channel.id][0]
                        if (!!!playlistArray[connection.channel.id][0]) {
                            delete playlistArray[connection.channel.id]
                        }
                        else {
                            playSong(connection, playlistArray[connection.channel.id][0], true)
                        }
                    }
                }
            }, 1000)
        })
        streamsArray[connection.channel.id].on('error', (err) => {
            console.log(`Erreur : ${err}`)
        })
    }
}

exports.checkURL = function (connection, url, bypass) {
    if (bypass) {
        return true
    }
    // check if url is correct & put youtube link in playlist array
    playlistArray[connection.channel.id].push('https://www.youtube.com/watch?v=9w_zn3uRwPU')
    return true
}

exports.quit = function (message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!connectionsArray[userChannel.id]) {
        connectionsArray[userChannel.id].channel.leave()
        delete connectionsArray[userChannel.id]
        delete streamsArray[userChannel.id]
        delete playlistArray[userChannel.id]
    }
    else {
        message.channel.send('Not connected in voice channel')
    }
}

exports.pause = function (message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!streamsArray[userChannel.id]) {
        streamsArray[userChannel.id].pause()
        pausedArray[userChannel.id] = 'onPause'
    }
}

exports.resume = function (message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!pausedArray[userChannel.id]) {
        streamsArray[userChannel.id].resume()
        delete pausedArray[userChannel.id]
    }
}