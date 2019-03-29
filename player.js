const ytdl = require('ytdl-core')
const Helper = require('./helper.js')
const _ = require('lodash')
const { google } = require('googleapis')

var connectionsArray = []
var streamsArray = []
var pausedArray = []
var playlistArray = []
var playlistInfos = []
var connectedGuild = []

function playSongs(message, url) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        if (!!!connectedGuild[message.guild.id]) {
            if (url.indexOf('playlist') !== -1) {
                getPlaylist(voiceChannel, message, url)
            }
            else {
                getVideo(voiceChannel, message, url)
            }
        }
        else {
            if (connectedGuild[message.guild.id] === voiceChannel.id) {
                if (url.indexOf('playlist') !== -1) {
                    getPlaylist(voiceChannel, message, url, false)
                }
                else {
                    getVideo(voiceChannel, message, url, false)
                }
            }
            else {
                message.channel.send("Vous n'êtes pas dans le même canal que le bot !")
            }
        }

    }
    else {
        message.reply('You need to join a voice channel first !');
    }
};

function playSong(message, connection) {
    sendMusicEmbed(message, connection, playlistInfos[connection.channel.id][0].title)
    connectionsArray[connection.channel.id] = connection
    streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(ytdl(playlistArray[connection.channel.id][0], { filter: 'audioonly' }))
    streamsArray[connection.channel.id].setVolume(0.5)
    streamsArray[connection.channel.id].on('end', () => {
        setTimeout(() => {
            if (!!playlistArray[connection.channel.id]) {
                delete playlistArray[connection.channel.id][0]
                delete playlistInfos[connection.channel.id][0]
                playlistArray[connection.channel.id] = _.compact(playlistArray[connection.channel.id])
                playlistInfos[connection.channel.id] = _.compact(playlistInfos[connection.channel.id])
                if (!!!playlistArray[connection.channel.id][0]) {
                    quit(message)
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

function sendMusicEmbed(message, connection, musicTitle, added = false) {
    let title = "Music"
    let color = false
    let playArray = false
    if (added) {
        title = "Added music"
        // #398240
        color = 3768896
    }
    else {
        // #354F94
        color = 3493780
    }
    if (!!connection.channel) {
        playArray = playlistArray[connection.channel.id]
    }
    if (!!connection.id) {
        playArray = playlistArray[connection.id]
    }
    message.channel.send({
        "embed": {
            "color": color,
            "author": {
                "name": title,
                "icon_url": "https://i2.wp.com/www.lesforetsduperche.fr/wp-content/uploads/2017/06/note-de-musique.png"
            },
            "fields": [
                {
                    "name": "Title",
                    "value": `${musicTitle}`
                },
                {
                    "name": "Queued",
                    "value": `${playArray.length - 1}`
                }
            ]
        }
    })
}

function getPlaylist(voiceChannel, message, url, playSongParams = true, pageToken = '', play = false, connection = false) {
    let playlistId = url.substr(url.indexOf('list=') + 5, url.length - (url.indexOf('list=') + 5))
    if (!!playlistId) {
        let service = google.youtube('v3')
        service.playlistItems.list({
            key: "AIzaSyDDRQTDxXfvACI7AQwYrR25KqpR-7ZNNLE",
            playlistId: playlistId,
            maxResults: 50,
            pageToken: pageToken,
            part: "snippet, contentDetails"
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                message.channel.send("Une erreur c'est produite !")
                return false;
            }
            else {
                if (response.data.items.length) {
                    if (playSongParams) {
                        voiceChannel.join()
                            .then(connection => {
                                playlistArray[voiceChannel.id] = []
                                playlistInfos[voiceChannel.id] = []
                                connectedGuild[message.guild.id] = voiceChannel.id
                                addPlaylistItems(voiceChannel, message, url, response, false, connection, 'play')
                            })
                    }
                    else {
                        addPlaylistItems(voiceChannel, message, url, response, false, connection, play)
                    }
                }
            }
        });
    }
}

function addPlaylistItems(voiceChannel, message, url, response, playSongParams, connection, play = false) {
    let videoURL = 'https://www.youtube.com/watch?v='
    let data = response.data
    data.items.map(item => {
        playlistArray[voiceChannel.id].push(videoURL + item.snippet.resourceId.videoId)
        playlistInfos[voiceChannel.id].push({ title: item.snippet.title })
    })
    if (!!data.nextPageToken) {
        getPlaylist(voiceChannel, message, url, playSongParams, data.nextPageToken, play, connection)
    }
    else {
        if (play === 'play') {
            playSong(message, connection)
        }
        else {
            sendMusicEmbed(message, voiceChannel, 'Playlist songs', true)
        }
    }
}

function getVideo(voiceChannel, message, url, playSongParams = true) {
    let videoId = url.substr(url.indexOf("watch?v=") + 8, url.indexOf('&list') - (url.indexOf("watch?v=") + 8))
    if (!!videoId) {
        let service = google.youtube('v3')
        service.videos.list({
            key: "AIzaSyDDRQTDxXfvACI7AQwYrR25KqpR-7ZNNLE",
            id: videoId,
            part: "snippet, contentDetails"
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                message.channel.send("Une erreur c'est produite !")
                return false;
            }
            else {
                if (response.data.items.length) {
                    if (playSongParams) {
                        voiceChannel.join()
                            .then(connection => {
                                playlistInfos[voiceChannel.id] = []
                                playlistArray[voiceChannel.id] = []
                                playlistArray[voiceChannel.id].push(url)
                                playlistInfos[voiceChannel.id].push({ title: response.data.items[0].snippet.title })
                                connectedGuild[message.guild.id] = voiceChannel.id
                                playSong(message, connection)
                            })
                    }
                    else {
                        playlistArray[voiceChannel.id].push(url)
                        playlistInfos[voiceChannel.id].push({ title: response.data.items[0].snippet.title })
                        sendMusicEmbed(message, connectionsArray[voiceChannel.id], response.data.items[0].snippet.title, true)
                    }
                }
            }
        });
    }
    else {
        message.channel.send('URL invalide !')
    }
}

function quit(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!connectionsArray[userChannel.id] && connectedGuild[message.guild.id] === userChannel.id) {
        connectionsArray[userChannel.id].channel.leave()
        delete connectionsArray[userChannel.id]
        delete streamsArray[userChannel.id]
        delete playlistArray[userChannel.id]
        delete playlistInfos[userChannel.id]
        delete connectedGuild[message.guild.id]
        if (!!pausedArray[userChannel.id]) {
            delete pausedArray[userChannel.id]
        }
    }
    else {
        message.channel.send("Vous n'êtes pas dans le même canal que le bot !")
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

function next(message) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (!!streamsArray[userChannel.id] && connectedGuild[message.guild.id] === userChannel.id) {
        if (!!playlistArray[userChannel.id]) {
            streamsArray[userChannel.id].destroy()
        }
    }
    else {
        message.channel.send("Vous n'êtes pas dans le même canal que le bot !")
    }
}

exports.playSongs = playSongs
exports.playSong = playSong
exports.quit = quit
exports.pause = pause
exports.resume = resume
exports.next = next