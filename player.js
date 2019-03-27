const ytdl = require('ytdl-core')
const Helper = require('./helper.js')
const axios = require('axios')
const _ = require('lodash')

var connectionsArray = []
var streamsArray = []
var pausedArray = []
var playlistArray = []
var connectedGuild = []

function playSongs(message, url) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        if (!!!connectedGuild[message.guild.id]) {
            voiceChannel
                .join()
                .then(function (connection) {
                    connectedGuild[message.guild.id] = voiceChannel.id
                    console.log('guild id : ', message.guild.id)
                    setTimeout(() => {
                        //playSong(message, connection, url, false)
                        getURL(message, connection, url)
                    }, 1000)
                })
        }
        else {
            if (connectedGuild[message.guild.id] === voiceChannel.id) {
                //playSong(message, connectionsArray[voiceChannel.id], url, false)
                getURL(message, connectionsArray[voiceChannel.id], url, true)
            }
            else {
                message.channel.send("Vous n'êtes pas dans le même canal que le bot !")
            }
        }

    }
    else {
        message.reply('You need to join a voice channel first!');
    }
};

function playSong(message, connection) {
    connectionsArray[connection.channel.id] = connection
    streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(ytdl(playlistArray[connection.channel.id][0], { filter: 'audioonly' }))
    streamsArray[connection.channel.id].setVolume(0.5)
    streamsArray[connection.channel.id].on('end', () => {
        setTimeout(() => {
            console.log('End music')
            if (!!playlistArray[connection.channel.id]) {
                delete playlistArray[connection.channel.id][0]
                playlistArray[connection.channel.id] = _.compact(playlistArray[connection.channel.id])
                if (!!!playlistArray[connection.channel.id][0]) {
                    delete playlistArray[connection.channel.id]
                    delete connectedGuild[message.guild.id]
                    connectionsArray[connection.channel.id].channel.leave()
                }
                else {
                    playSong(message, connection)
                }
            }
        }, 1000)
    })
    streamsArray[connection.channel.id].on('error', (err) => {
        console.log(`Erreur : ${err}`)
    })
}

function getURL(message, connection, url, queued = false) {
    // check if url is correct & put youtube link in playlist array
    if (!!!playlistArray[connection.channel.id]) {
        playlistArray[connection.channel.id] = []
    }
    //playlistArray[connection.channel.id].push('https://www.youtube.com/watch?v=9w_zn3uRwPU')
    console.log('added music')
    axios.get(url)
        .then(response => {
            console.log('STATUS : ', response.status)
            if (response.status !== '404') {
                playlistArray[connection.channel.id].push(url)
                if (queued === false) {
                    playSong(message, connection)
                }
            }
        })
}

function quit(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!connectionsArray[userChannel.id] && connectedGuild[message.guild.id] === userChannel.id) {
        connectionsArray[userChannel.id].channel.leave()
        delete connectionsArray[userChannel.id]
        delete streamsArray[userChannel.id]
        delete playlistArray[userChannel.id]
        delete connectedGuild[message.guild.id]
        if (!!pausedArray[userChannel.id]) {
            delete pausedArray[userChannel.id]
        }
    }
    else {
        message.channel.send('Not connected in voice channel')
    }
}

function pause(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!streamsArray[userChannel.id] && connectedGuild[message.guild.id] === userChannel.id) {
        streamsArray[userChannel.id].pause()
        pausedArray[userChannel.id] = 'onPause'
    }
}

function resume(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!pausedArray[userChannel.id] && connectedGuild[message.guild.id] === userChannel.id) {
        streamsArray[userChannel.id].resume()
        delete pausedArray[userChannel.id]
    }
}

exports.playSongs = playSongs
exports.playSong = playSong
exports.getURL = getURL
exports.quit = quit
exports.pause = pause
exports.resume = resume