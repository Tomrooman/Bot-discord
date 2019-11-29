const ytdl = require('ytdl-core')
const Helper = require('./helper.js')
const _ = require('lodash')
const { google } = require('googleapis')
const config = require('./../../config.json')

const connectionsArray = []
const streamsArray = []
const pausedArray = []
const playlistArray = []
const playlistInfos = []
const connectedGuild = []
const radioPlayed = []

function playSongs(message, command, url) {
    const voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        if (!connectedGuild[message.guild.id]) {
            playSongsAndConnectOrNotBot(voiceChannel, message, command, url)
        }
        else if (connectedGuild[message.guild.id] === voiceChannel.id) {
            playSongsAndConnectOrNotBot(voiceChannel, message, command, url, false)
        }
        else {
            message.channel.send('Vous n\'êtes pas dans le même canal que le bot !')
        }
    }
    else {
        message.channel.send('Vous devez être connecté dans un salon !');
    }
}

function playSongsAndConnectOrNotBot(voiceChannel, message, command, url, playSongParams = true) {
    if (command === 'playlist') {
        if (url.indexOf('list=') !== -1) {
            getPlaylist(voiceChannel, message, url, playSongParams)
        }
        else {
            message.channel.send('Merci de renseigner une URL de playlist valide !')
        }
    }
    else if (url.indexOf('playlist') !== -1) {
        getPlaylist(voiceChannel, message, url, playSongParams)
    }
    else {
        getVideo(voiceChannel, message, url, playSongParams)
    }
}

function playSong(message, connection) {
    sendMusicEmbed(message, connection, playlistInfos[connection.channel.id][0].title, playlistInfos[connection.channel.id][0].id, [false, 1])
    connectionsArray[connection.channel.id] = connection
    streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(ytdl(playlistArray[connection.channel.id][0], { filter: 'audioonly' }))
    streamsArray[connection.channel.id].setVolume(0.5)
    streamsArray[connection.channel.id].on('end', () => {
        setTimeout(() => {
            if (playlistArray[connection.channel.id]) {
                delete playlistArray[connection.channel.id][0]
                delete playlistInfos[connection.channel.id][0]
                playlistArray[connection.channel.id] = _.compact(playlistArray[connection.channel.id])
                playlistInfos[connection.channel.id] = _.compact(playlistInfos[connection.channel.id])
                if (!playlistArray[connection.channel.id][0]) {
                    setTimeout(() => {
                        quit(message)
                    }, 5000)
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

function sendMusicEmbed(message, connection, musicTitle, musicId, added = [false, 1]) {
    let title = 'Musique'
    let color = false
    let playArray = false
    let musicLink = musicTitle
    let thumbnail = ''
    if (musicTitle !== 'Playlist') {
        musicLink = `[${musicTitle}](https://www.youtube.com/watch?v=${musicId})`
    }
    if (added[0]) {
        if (added[1] > 1) {
            title = 'Musiques ajoutées'
        }
        else {
            title = 'Musique ajoutée'
            thumbnail = playlistInfos[connection.channel.id][0].thumbnail
        }
        // #398240 | Vert foncé
        color = 3768896
    }
    else {
        // #354F94 | Bleu foncé
        color = 3493780
        thumbnail = playlistInfos[connection.channel.id][0].thumbnail
    }
    if (connection.channel) {
        playArray = playlistArray[connection.channel.id]
    }
    if (connection.id) {
        playArray = playlistArray[connection.id]
    }
    message.channel.send({
        'embed': {
            'color': color,
            'author': {
                'name': title,
                'icon_url': 'https://syxbot.com/img/embed_music.png'
            },
            'thumbnail': {
                'url': thumbnail
            },
            'fields': [
                {
                    'name': 'Titre',
                    'value': musicLink,
                    'inline': true
                },
                {
                    'name': 'File d\'attente',
                    'value': `${playArray.length - 1}`,
                    'inline': true
                }
            ]
        }
    })
}

function getPlaylist(voiceChannel, message, url, playSongParams = true, pageToken = '', play = false, connection = false) {
    const endPlaylistId = url.indexOf('&', url.indexOf('&') + 1)
    let playlistId = ''
    if (endPlaylistId !== -1) {
        let playlistLength = url.length - (url.indexOf('&') + 5)
        playlistLength -= url.length - endPlaylistId
        playlistLength -= 1;
        playlistId = url.substr(url.indexOf('&list=') + 6, playlistLength)
    }
    else {
        playlistId = url.substr(url.indexOf('?list=') + 6, url.length - (url.indexOf('?list=') + 6))
    }
    if (playlistId) {
        callYoutubeApiAndAddItems(playlistId, voiceChannel, message, url, playSongParams, pageToken, play, connection)
    }
}

function callYoutubeApiAndAddItems(playlistId, voiceChannel, message, url, playSongParams, pageToken, play, connection) {
    const service = google.youtube('v3')
    service.playlistItems.list({
        key: config.googleKey,
        playlistId: playlistId,
        maxResults: 50,
        pageToken: pageToken,
        part: 'snippet, contentDetails'
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            message.channel.send('Une erreur s\'est produite !')
            return false;
        }
        else if (response.data.items.length) {
            if (playSongParams) {
                voiceChannel.join()
                    .then(conection => {
                        playlistArray[voiceChannel.id] = []
                        playlistInfos[voiceChannel.id] = []
                        connectedGuild[message.guild.id] = voiceChannel.id
                        addPlaylistItems(voiceChannel, message, url, response, false, conection, 'play')
                    })
            }
            else {
                addPlaylistItems(voiceChannel, message, url, response, false, connection, play)
            }
        }
    });
}

function addPlaylistItems(voiceChannel, message, url, response, playSongParams, connection, play = false) {
    const videoURL = 'https://www.youtube.com/watch?v='
    const data = response.data
    if (radioPlayed[voiceChannel.id] === 'played') {
        playlistArray[voiceChannel.id] = []
        playlistInfos[voiceChannel.id] = []
        radioPlayed[voiceChannel.id] = 'notPlay'
    }
    data.items.map(item => {
        playlistArray[voiceChannel.id].push(videoURL + item.snippet.resourceId.videoId)
        playlistInfos[voiceChannel.id].push({
            title: item.snippet.title,
            id: item.snippet.resourceId.videoId,
            thumbnail: item.snippet.thumbnails.default.url
        })
    })
    if (data.nextPageToken) {
        getPlaylist(voiceChannel, message, url, playSongParams, data.nextPageToken, play, connection)
    }
    else if (play === 'play') {
        playSong(message, connection)
    }
    else {
        sendMusicEmbed(message, voiceChannel, 'Playlist', false, [true, data.items.length])
        if (radioPlayed[voiceChannel.id]) {
            streamsArray[voiceChannel.id].destroy()
            delete radioPlayed[voiceChannel.id]
            playSong(message, connectionsArray[voiceChannel.id])
        }
    }
}


function getVideo(voiceChannel, message, url, playSongParams = true) {
    let videoId = false
    if (url.indexOf('&list') !== -1) {
        videoId = url.substr(url.indexOf('watch?v=') + 8, url.indexOf('&list') - (url.indexOf('watch?v=') + 8))
    }
    else {
        videoId = url.substr(url.indexOf('watch?v=') + 8)

    }
    if (videoId) {
        const service = google.youtube('v3')
        service.videos.list({
            key: config.googleKey,
            id: videoId,
            part: 'snippet, contentDetails'
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                message.channel.send('Une erreur s\'est produite !')
                return false;
            }
            else if (response.data.items.length) {
                setMusicArrayAndPlayMusic(voiceChannel, response, message, url, playSongParams)
            }
        });
    }
    else {
        message.channel.send('URL invalide !')
    }
}

function setMusicArrayAndPlayMusic(voiceChannel, response, message, url, playSongParams) {
    if (playSongParams) {
        voiceChannel.join()
            .then(connection => {
                clearAndAddArrayInfos(voiceChannel, url, response)
                connectedGuild[message.guild.id] = voiceChannel.id
                playSong(message, connection)
            })
    }
    else if (radioPlayed[voiceChannel.id]) {
        streamsArray[voiceChannel.id].destroy()
        delete radioPlayed[voiceChannel.id]
        clearAndAddArrayInfos(voiceChannel, url, response)
        playSong(message, connectionsArray[voiceChannel.id])
    }
    else {
        clearAndAddArrayInfos(voiceChannel, url, response, false)
        sendMusicEmbed(message, connectionsArray[voiceChannel.id], response.data.items[0].snippet.title, response.data.items[0].id, [true, 1])
    }
}

function clearAndAddArrayInfos(voiceChannel, url, response, clear = true) {
    if (clear) {
        playlistArray[voiceChannel.id] = []
        playlistInfos[voiceChannel.id] = []
    }
    playlistArray[voiceChannel.id].push(url)
    playlistInfos[voiceChannel.id].push({
        title: response.data.items[0].snippet.title,
        id: response.data.items[0].id,
        thumbnail: response.data.items[0].snippet.thumbnails.default.url
    })
}

function radioExist(words) {
    if (words[1].toLowerCase() === 'nrj' || words[1].toLowerCase() === 'subarashii') {
        return true
    }
    return false
}

function radio(message, words) {
    const voiceChannel = Helper.take_user_voiceChannel(message)
    if (!!words[1] && radioExist(words)) {
        let radioLink = false
        if (words[1].toLowerCase() === 'nrj') {
            radioLink = 'http://cdn.nrjaudio.fm/audio1/fr/40125/aac_64.mp3'
        }
        if (words[1].toLowerCase() === 'subarashii') {
            radioLink = 'http://listen.radionomy.com/subarashii.mp3'
        }
        if (voiceChannel) {
            radioPlayed[voiceChannel.id] = 'played'
            if (!connectedGuild[message.guild.id]) {
                voiceChannel.join()
                    .then(connection => {
                        connectionsArray[connection.channel.id] = connection
                        connectedGuild[message.guild.id] = voiceChannel.id
                        streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(radioLink)
                        streamsArray[connection.channel.id].setVolume(0.5)
                    })
            }
            else if (Helper.verifyBotLocation(message)) {
                delete playlistArray[voiceChannel.id]
                delete playlistInfos[voiceChannel.id]
                streamsArray[voiceChannel.id].destroy()
                streamsArray[voiceChannel.id] = connectionsArray[voiceChannel.id].playStream(radioLink)
                streamsArray[voiceChannel.id].setVolume(0.5)
            }
        }
        else {
            message.channel.send('Vous devez être connecté dans un salon !')
        }
    }
    else {
        message.channel.send('Choisir une radio, c\'est mieux !')
    }
}

function getVerifyBotLocationInfos(userChannelId, guildId) {
    return [connectionsArray[userChannelId], connectedGuild[guildId]]
}

function showQueuedSongs(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (playlistInfos[userChannel.id]) {
        const songs = []
        playlistInfos[userChannel.id].map((music, index) => {
            console.log('Music title : ', music.title)
            console.log('Index : ', index)
            songs.push('```' + index + '```' + ' ' + music.title + '\n')
        })
    }
    else {
        message.channel.send('Aucune musique dans la file d\'attente')
    }
}

function quit(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message)) {
        connectionsArray[userChannel.id].channel.leave()
        delete connectionsArray[userChannel.id]
        delete streamsArray[userChannel.id]
        delete playlistArray[userChannel.id]
        delete playlistInfos[userChannel.id]
        delete connectedGuild[message.guild.id]
        delete radioPlayed[userChannel.id]
        if (pausedArray[userChannel.id]) {
            delete pausedArray[userChannel.id]
        }
    }
}

function pause(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message)) {
        streamsArray[userChannel.id].pause()
        pausedArray[userChannel.id] = 'onPause'
    }
}

function resume(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message)) {
        streamsArray[userChannel.id].resume()
        delete pausedArray[userChannel.id]
    }
}

function next(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message)) {
        if (playlistArray[userChannel.id]) {
            streamsArray[userChannel.id].destroy()
        }
    }
}

exports.playSongs = playSongs
exports.playSong = playSong
exports.quit = quit
exports.pause = pause
exports.resume = resume
exports.next = next
exports.radio = radio
exports.showQueuedSongs = showQueuedSongs
exports.getVerifyBotLocationInfos = getVerifyBotLocationInfos