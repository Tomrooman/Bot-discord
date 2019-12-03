const ytdl = require('ytdl-core')
const Helper = require('./helper.js')
const _ = require('lodash')
const { google } = require('googleapis')
const config = require('./../../config.json')
const moment = require('moment')

const connectionsArray = []
const streamsArray = []
const pausedArray = []
const playlistArray = []
const playlistInfos = []
const connectedGuild = []
const radioPlayed = []
const searchArray = []
const searchPlaylistArray = []
const loopArray = []
const waitArray = []
const nextSetLoop = []
const isPlaying = []
const radioAvailable = ['nrj', 'subarashii']

function playSongs(message, command, words) {
    const voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        if (!connectedGuild[message.guild.id]) {
            playSongsAndConnectOrNotBot(voiceChannel, message, command, words)
        }
        else if (connectedGuild[message.guild.id] === voiceChannel.id) {
            playSongsAndConnectOrNotBot(voiceChannel, message, command, words, false)
        }
        else {
            message.channel.send('Vous n\'êtes pas dans le même canal que le bot !')
        }
    }
    else {
        message.channel.send('Vous devez être connecté dans un salon !');
    }
}

function playSongsAndConnectOrNotBot(voiceChannel, message, command, words, playSongParams = true) {
    const url = words[1]
    if (url && url.includes('youtu') && (url.includes('http://') || url.includes('https://'))) {
        if (command === 'playlist' || command === 'pl') {
            if (url.indexOf('list=') !== -1) {
                getPlaylist(voiceChannel, message, url, playSongParams)
            }
            else {
                message.channel.send('Merci de renseigner une URL de playlist valide !')
            }
        }
        else if (command === 'play' || command === 'p') {
            if (url.indexOf('playlist') !== -1) {
                getPlaylist(voiceChannel, message, url, playSongParams)
            }
            else {
                getVideo(voiceChannel, message, url, playSongParams)
            }
        }
    }
    else {
        delete words[0];
        const title = words.join(' ')
        if (command === 'playlist' || command === 'pl') {
            searchYoutubeVideosByTitle(message, title, voiceChannel, 'playlist')
        }
        else if (command === 'play' || command === 'p') {
            searchYoutubeVideosByTitle(message, title, voiceChannel)
        }
    }
}

function searchYoutubeVideosByTitle(message, title, voiceChannel, type = 'video') {
    const service = google.youtube('v3')
    service.search.list({
        key: config.googleKey,
        q: title,
        part: 'snippet',
        type: type
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            message.channel.send('Une erreur s\'est produite !')
            return false;
        }
        else if (response.data.items.length) {
            if (type === 'video') {
                delete searchArray[voiceChannel.id]
            }
            else {
                delete searchPlaylistArray[voiceChannel.id]
            }
            createSearchArray(message, voiceChannel, response.data.items, type)
        }
        else {
            message.channel.send(`Aucun résultat pour la recherche : ${title}`)
        }
    });
}

function toggleLoop(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistArray[userChannel.id] && playlistArray[userChannel.id].length) {
            if (!loopArray[userChannel.id]) {
                loopArray[userChannel.id] = true
                message.channel.send('Boucle activée !')
            }
            else {
                delete loopArray[userChannel.id]
                message.channel.send('Boucle désactivée !')
            }
        }
        else {
            message.channel.send('Vous n\'écoutez pas de musique !')
        }
    }
}

function createSearchArray(message, voiceChannel, items, type = 'video') {
    const videoURL = 'https://www.youtube.com/watch?v='
    const playlistURL = 'https://www.youtube.com/playlist?list='
    let resultChoices = ''
    if (type === 'video') {
        searchArray[voiceChannel.id] = []
    }
    else {
        searchPlaylistArray[voiceChannel.id] = []
    }
    items.map((item, index) => {
        resultChoices += '> **' + (index + 1) + '**. ' + item.snippet.title + '\n'
        if (type === 'video' && item.id.videoId) {
            searchArray[voiceChannel.id].push({
                url: videoURL + item.id.videoId,
                title: item.snippet.title
            })
        }
        else if (type === 'playlist') {
            searchPlaylistArray[voiceChannel.id].push({
                url: playlistURL + item.id.playlistId,
                title: item.snippet.title
            })
        }
    })
    if (type === 'video') {
        message.channel.send(`> **Selectionnez une musique parmi les ${items.length} ci-dessous.** \n > **Ex: ${config.prefix}search p ${items.length}** \n > \n ${resultChoices}`)
    }
    else {
        message.channel.send(`> **Selectionnez une playlist parmi les ${items.length} ci-dessous.** \n > **Ex: ${config.prefix}search pl ${items.length}** \n > \n ${resultChoices}`)
    }
}

function selectSongOrPlaylistInSearchList(message, words) {
    if (words[1] === 'p' || words[1] === 'play') {
        if (words[2]) {
            selectSongInSearchList(message, parseInt(words[2]))
        }
        else {
            message.channel.send('Veuillez écrire le numéro de la musique sélectionnée !')
        }
    }
    else if (words[1] === 'pl' || words[1] === 'playlist') {
        if (words[2]) {
            selectSongInSearchList(message, parseInt(words[2]), 'playlist')
        }
        else {
            message.channel.send('Veuillez écrire le numéro de la playlist sélectionnée !')
        }
    }
    else {
        message.channel.send('Vous devez écrire le type de sélection.```Ex: ' + config.prefix + 'search p 3```')
    }
}

function selectSongInSearchList(message, number, type = 'musique') {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (userChannel) {
        if (Number.isFinite(parseInt(number))) {
            const choiceArray = type === 'musique' ? searchArray[userChannel.id] : searchPlaylistArray[userChannel.id]
            if (choiceArray && choiceArray.length) {
                if (number >= 1 && number <= choiceArray.length) {
                    const command = type === 'musique' ? 'play' : 'playlist'
                    playSongs(message, command, ['useless', choiceArray[number - 1].url])
                }
                else {
                    message.channel.send(`Choisissez un chiffre compris entre 1 et ${choiceArray.length}`)
                }
            }
            else {
                message.channel.send(`Aucune ${type} enregistrée dans la recherche`)
            }
        }
        else {
            message.channel.send('Vous devez écrire un chiffre après le mot search !')
        }
    }
    else {
        message.channel.send('Vous devez être connecté dans un salon !')
    }
}

function getSongInSearchList(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (userChannel) {
        const musicExist = searchArray[userChannel.id] && searchArray[userChannel.id].length
        const playlistExist = searchPlaylistArray[userChannel.id] && searchPlaylistArray[userChannel.id].length
        if (musicExist || playlistExist) {
            makeAndSendSearchListArray(message, userChannel, musicExist, playlistExist)
        }
        else {
            message.channel.send('Aucune musique enregistrée dans la recherche')
        }
    }
    else {
        message.channel.send('Vous devez être connecté dans un salon !')
    }
}

function makeAndSendSearchListArray(message, userChannel, musicExist, playlistExist) {
    let resultChoices = ''
    if (musicExist && playlistExist) {
        resultChoices += '> **Musiques** \n'
        searchArray[userChannel.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        resultChoices += '> \n'
        resultChoices += '> **Playlists** \n'
        searchPlaylistArray[userChannel.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        const countChoices = searchPlaylistArray[userChannel.id].length + searchArray[userChannel.id].length
        message.channel.send(`> **Faites un choix parmi les ${countChoices} ci-dessous.** \n > **Ex: ${config.prefix}search p ${searchArray[userChannel.id].length}** \n > **Ex: ${config.prefix}search pl ${searchPlaylistArray[userChannel.id].length}** \n > \n ${resultChoices}`)
    }
    else if (musicExist && !playlistExist) {
        resultChoices += '> **Musiques** \n'
        searchArray[userChannel.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        message.channel.send(`> **Selectionnez une musique parmi les ${searchArray[userChannel.id].length} ci-dessous.** \n > **Ex: ${config.prefix}search p ${searchArray[userChannel.id].length}** \n > \n ${resultChoices}`)
    }
    else {
        resultChoices += '> **Playlists** \n'
        searchPlaylistArray[userChannel.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        message.channel.send(`> **Selectionnez une playlist parmi les ${searchPlaylistArray[userChannel.id].length} ci-dessous.** \n > **Ex: ${config.prefix}search pl ${searchPlaylistArray[userChannel.id].length}** \n > \n ${resultChoices}`)
    }
}

function playSong(message, connection, retry = false) {
    if (connection) {
        isPlaying[connection.channel.id] = true
    }
    const startDate = moment().valueOf() / 1000
    connectionsArray[connection.channel.id] = connection
    const stream = ytdl(playlistArray[connection.channel.id][0], { filter: 'audio', liveBuffer: 10000 })
    streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(stream)
    streamsArray[connection.channel.id].setVolume(0.4)
    if (!retry) {
        sendMusicEmbed(message, connection, playlistInfos[connection.channel.id][0].title, playlistInfos[connection.channel.id][0].id, [false, 1])
    }
    streamsArray[connection.channel.id].on('end', () => {
        setTimeout(() => {
            setArrays(message, connection, startDate)
        }, 1000)
    })
}

function setArrays(message, connection, startDate) {
    // const userChannel = Helper.take_user_voiceChannel(message)
    const endDate = moment().valueOf() / 1000
    const secondsDiff = Math.floor(endDate - startDate)
    delete isPlaying[connection.channel.id]
    // If still connected but the end callback is call to early (after few seconds of playing)
    if (connectedGuild[connection.channel.id] && secondsDiff < 4) {
        console.log('Retry song')
        playSong(message, connectionsArray[connection.channel.id], true)
    }
    if (playlistArray[connection.channel.id]) {
        // If loop is desactivate
        if (!loopArray[connection.channel.id]) {
            delete playlistArray[connection.channel.id][0]
            delete playlistInfos[connection.channel.id][0]
            playlistArray[connection.channel.id] = _.compact(playlistArray[connection.channel.id])
            playlistInfos[connection.channel.id] = _.compact(playlistInfos[connection.channel.id])
        }
        // If playlist is empty
        if (!playlistArray[connection.channel.id][0]) {
            waitArray[connection.channel.id] = true
            delete loopArray[connection.channel.id]
            message.channel.send('Plus de musique en file d\'attente')
        }
        else {
            // If loop is activate and command 'next' is called
            if (nextSetLoop[connection.channel.id]) {
                loopArray[connection.channel.id] = true
                delete nextSetLoop[connection.channel.id]
            }
            // A TESTER TESTER TESTER TESTER TESTER TESTER TESTER
            // userChannel.join()
            // .then(connection => {
            //     playSong(message, connection)
            // })
            playSong(message, connection)
        }
    }
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
            'footer': '"' + config.prefix + 'p list" pour afficher la file d\'attente',
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
    else if (url.indexOf('?list=') !== -1) {
        playlistId = url.substr(url.indexOf('?list=') + 6, url.length - (url.indexOf('?list=') + 6))
    }
    else {
        playlistId = url.substr(url.indexOf('&list=') + 6, url.length - (url.indexOf('&list=') + 6))
    }
    callYoutubeApiAndAddItems(playlistId, voiceChannel, message, url, playSongParams, pageToken, play, connection)
}

function callYoutubeApiAndAddItems(playlistId, voiceChannel, message, url, playSongParams, pageToken, play, connection) {
    const service = google.youtube('v3')
    service.playlistItems.list({
        key: config.googleKey,
        playlistId: playlistId,
        maxResults: 50,
        pageToken: pageToken,
        part: 'snippet'
    }, function (err, response) {
        if (err) {
            console.log('ERROR: ' + err.code);
            if (err.code !== 404) {
                message.channel.send('Une erreur s\'est produite !')
                return false;
            }
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
        else {
            checkIfMustPlay(message, voiceChannel, connection, pageToken)
        }
    });
}

function checkIfMustPlay(message, voiceChannel, connection, pageToken) {
    // If response is empty but there are song in queued so send the added message
    if (pageToken && playlistArray[voiceChannel.id] && playlistArray[voiceChannel.id].length) {
        sendMusicEmbed(message, voiceChannel, 'Playlist', false, [true, 2])
        // If bot is not currently playing so play the song
        if (!isPlaying[voiceChannel.id]) {
            if (!connection) {
                const newConnect = Helper.take_user_voiceChannel(message)
                newConnect.join()
                    .then(connect => {
                        playSong(message, connect)
                    })
            }
            else {
                playSong(message, connection)
            }
        }
    }
    else {
        message.channel.send('Fonctionnalité temporairement indisponible')
    }
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
        let thumbnailURL = ''
        if (item.snippet.thumbnails) {
            thumbnailURL = item.snippet.thumbnails.default.url
        }
        playlistInfos[voiceChannel.id].push({
            title: item.snippet.title,
            id: item.snippet.resourceId.videoId,
            thumbnail: thumbnailURL
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
        else if (waitArray[voiceChannel.id]) {
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
            part: 'snippet'
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
    if (playSongParams || waitArray[voiceChannel.id]) {
        delete waitArray[voiceChannel.id]
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

function radioExist(radioCheck) {
    let checkExist = false
    radioAvailable.map(r => {
        if (r === radioCheck) {
            checkExist = true
        }
    })
    return checkExist
}

function getRadioLink(radioForLink) {
    if (radioForLink === 'nrj') {
        return 'http://cdn.nrjaudio.fm/audio1/fr/40125/aac_64.mp3'
    }
    else if (radioForLink === 'subarashii') {
        return 'http://listen.radionomy.com/subarashii.mp3'
    }
}

function showRadioList(message) {
    let stringRadioList = ''
    radioAvailable.map(r => {
        stringRadioList += '> - **' + r + '**\n'
    })
    message.channel.send('> Écrivez le nom de la radio que vous voulez écouter.\n > Ex: ' + config.prefix + 'radio nrj\n > \n ' + stringRadioList)
}

function radio(message, words) {
    const voiceChannel = Helper.take_user_voiceChannel(message)
    if (words[1]) {
        if (words[1].toLowerCase() === 'list') {
            showRadioList(message)
        }
        else if (radioExist(words[1].toLowerCase())) {
            connectRadio(voiceChannel, message, words)
        }
        else {
            message.channel.send('**Cette radio n\'existe pas !** \n Tapez **' + config.prefix + 'radio list** pour obtenir la liste des radios disponibles.')
        }
    }
    else {
        message.channel.send('Choisir une radio, c\'est mieux !')
    }
}

function connectRadio(voiceChannel, message, words) {
    const radioLink = getRadioLink(words[1].toLowerCase())
    if (voiceChannel) {
        delete loopArray[voiceChannel.id]
        radioPlayed[voiceChannel.id] = 'played'
        if (!connectedGuild[message.guild.id]) {
            voiceChannel.join()
                .then(connection => {
                    connectionsArray[connection.channel.id] = connection
                    connectedGuild[message.guild.id] = voiceChannel.id
                    streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].playStream(radioLink)
                    streamsArray[connection.channel.id].setVolume(0.4)
                })
        }
        else if (Helper.verifyBotLocation(message, voiceChannel)) {
            delete playlistArray[voiceChannel.id]
            delete playlistInfos[voiceChannel.id]
            streamsArray[voiceChannel.id].destroy()
            streamsArray[voiceChannel.id] = connectionsArray[voiceChannel.id].playStream(radioLink)
            streamsArray[voiceChannel.id].setVolume(0.4)
        }
    }
    else {
        message.channel.send('Vous devez être connecté dans un salon !')
    }
}

function getVerifyBotLocationInfos(userChannelId, guildId) {
    return [connectionsArray[userChannelId], connectedGuild[guildId]]
}

function getSongInPlaylist(message, number) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistInfos[userChannel.id].length) {
            if (number > 0 && number <= playlistInfos[userChannel.id].length) {
                // Add selected music at the top of the list
                playlistInfos[userChannel.id].splice(1, 0, playlistInfos[userChannel.id][number])
                playlistArray[userChannel.id].splice(1, 0, playlistArray[userChannel.id][number])
                // Remove selected music from where we copy it (+1 because we add an item before)
                delete playlistInfos[userChannel.id][number + 1]
                delete playlistArray[userChannel.id][number + 1]
                // Add the current music after the selected one
                playlistInfos[userChannel.id].splice(2, 0, playlistInfos[userChannel.id][0])
                playlistArray[userChannel.id].splice(2, 0, playlistArray[userChannel.id][0])
                // Destroy stream that call end callback (next song)
                streamsArray[userChannel.id].destroy()
            }
            else {
                let howToSay = 'chiffre'
                if (playlistInfos[userChannel.id].length >= 10) {
                    howToSay = 'nombre'
                }
                message.channel.send(`Choisissez un ${howToSay} compris entre 1 et ${playlistInfos[userChannel.id].length} - 1`)
            }
        }
        else {
            message.channel.send('Aucune musique dans la file d\'attente')
        }
    }
}

function showQueuedSongs(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistInfos[userChannel.id] && playlistInfos[userChannel.id].length >= 2) {
            // Create songs array and send multiple message if needed (max message length to 2000)
            createSongsString(userChannel).map((list, index) => {
                if (index === 0) {
                    if (playlistInfos[userChannel.id].length >= 3) {
                        message.channel.send(`> **Musiques en file d'attente** \n > \n${list}`)
                    }
                    else {
                        message.channel.send(`> **La musique en file d'attente** \n > \n${list}`)
                    }
                }
                else {
                    message.channel.send(`${list}`)
                }
            })
        }
        else {
            message.channel.send('Aucune musique dans la file d\'attente')
        }
    }
}

function createSongsString(userChannel) {
    const songsArray = []
    let songs = ''
    playlistInfos[userChannel.id].map((music, index) => {
        if (index !== 0) {
            const newSong = '> **' + index + '**. ' + music.title + '\n'
            if (songs.length + newSong.length >= 1950) {
                songsArray.push(songs)
                songs = newSong
            }
            else {
                songs += newSong
            }
        }
    })
    if (songs.length) {
        songsArray.push(songs)
    }
    return songsArray
}

function quit(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        connectionsArray[userChannel.id].channel.leave()
        delete connectionsArray[userChannel.id]
        delete streamsArray[userChannel.id]
        delete playlistArray[userChannel.id]
        delete playlistInfos[userChannel.id]
        delete connectedGuild[message.guild.id]
        delete radioPlayed[userChannel.id]
        delete loopArray[userChannel.id]
        delete pausedArray[userChannel.id]
        delete waitArray[userChannel.id]
        delete isPlaying[userChannel.id]
    }
}

function pause(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        streamsArray[userChannel.id].pause()
        pausedArray[userChannel.id] = 'onPause'
    }
}

function resume(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        streamsArray[userChannel.id].resume()
        delete pausedArray[userChannel.id]
    }
}

function next(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistArray[userChannel.id]) {
            if (loopArray[userChannel.id]) {
                delete loopArray[userChannel.id]
                nextSetLoop[userChannel.id] = true
            }
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
exports.getSongInPlaylist = getSongInPlaylist
exports.selectSongInSearchList = selectSongInSearchList
exports.getSongInSearchList = getSongInSearchList
exports.toggleLoop = toggleLoop
exports.selectSongOrPlaylistInSearchList = selectSongOrPlaylistInSearchList