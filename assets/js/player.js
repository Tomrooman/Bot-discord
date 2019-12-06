const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const ytsr = require('ytsr')
const Helper = require('./helper.js')
const _ = require('lodash')
const config = require('./../../config.json')

const connectionsArray = []
const streamsArray = []
const playlistArray = []
const playlistInfos = []
const connectedGuild = []
const radioPlayed = []
const searchArray = []
const searchPlaylistArray = []
const loopArray = []
const waitArray = []
const nextSetLoop = []
const tryToNext = []
const radioAvailable = [
    'NRJ',
    'Subarashii',
    'Bel-RTL',
    'Contact',
    'Nostalgie-BE',
    'Nostalgie-FR',
    'Classic21',
    'Pure-FM',
    'Musiq3',
    'VivaCite',
    'Fun-radio',
    'Rire&chanson',
    'Virgin',
    'RFM',
    'RMC',
    'BFM-Business',
    'jazz',
    'Cherie-FM',
    'Europe1',
    'RTL',
    'RTL2',
    'Classique',
    'Skyrock',
    'France-Inter',
    'France-Culture',
    'France-Musique',
    'France-Bleu'
]

function getPlaylistArrayLength(channelID) {
    if (playlistArray[channelID]) {
        return playlistArray[channelID].length
    }
    return false
}

function getStreamsBitfieldAndPause(channelID) {
    if (streamsArray[channelID]) {
        return [streamsArray[channelID].player.voiceConnection.speaking.bitfield, streamsArray[channelID].player.voiceConnection.player.dispatcher.pausedSince]
    }
    return false
}

function playSongs(message, command, words, byReaction = [false, false]) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (byReaction[0]) {
        voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1])
    }
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
    if (words[1] && words[1].includes('youtu') && (words[1].includes('http://') || words[1].includes('https://'))) {
        if (command === 'playlist' || command === 'pl') {
            if (ytpl.validateURL(words[1])) {
                getPlaylist(voiceChannel, message, words, playSongParams)
            }
            else {
                message.channel.send('Merci de renseigner une URL de playlist valide !')
            }
        }
        else if (command === 'play' || command === 'p') {
            if (ytdl.validateURL(words[1])) {
                getVideo(voiceChannel, message, words, playSongParams)
            }
            else {
                message.channel.send('Ce n\'est pas une URL de vidéo valide !')
            }
        }
    }
    else if (words[1]) {
        delete words[0];
        const title = words.join(' ')
        if (command === 'playlist' || command === 'pl') {
            youtubeResearch(message, title, voiceChannel, 'playlist')
            // searchYoutubeVideosByTitle(message, title, voiceChannel, 'playlist')
        }
        else if (command === 'play' || command === 'p') {
            youtubeResearch(message, title, voiceChannel, 'video')
            // searchYoutubeVideosByTitle(message, title, voiceChannel)
        }
    }
    else {
        message.channel.send('Vous n\'avez pas écrit de recherche !')
    }
}

function youtubeResearch(message, string, voiceChannel, type, nextPage = false) {
    const options = {
        limit: 50
    }
    if (nextPage) {
        options.nextpageRef = nextPage
    }
    else {
        message.channel.send('Recherche de ' + type + ' : ' + '`' + string.trim() + '`')
    }
    if (type === 'video' && !nextPage) {
        delete searchArray[voiceChannel.id]
        searchArray[voiceChannel.id] = []
    }
    else if (type === 'playlist' && !nextPage) {
        delete searchPlaylistArray[voiceChannel.id]
        searchPlaylistArray[voiceChannel.id] = []
    }
    ytsr(string, options, (err, searchresults) => {
        if (searchresults) {
            const buildedArray = makeSearchArray(voiceChannel, searchresults, type)
            if (buildedArray.length < 5 && searchresults.nextpageRef) {
                message.channel.send('> ' + buildedArray.length + '/5 trouvé')
                youtubeResearch(message, null, voiceChannel, type, searchresults.nextpageRef)
            }
            else if (buildedArray.length === 5 || !searchresults.nextpageRef) {
                // If i've got 5 item or no nextpageRef so send the list
                sendSearchResultsAsString(message, voiceChannel, type)
            }
        }
        else {
            console.log('Error search by title no results')
        }
    })
}

function makeSearchArray(voiceChannel, searchresults, type) {
    const filteredResult = searchresults.items.filter(i => i.type === type && i.title !== '[Deleted video]')
    filteredResult.map(result => {
        const resultObj = {
            url: result.link,
            title: result.title
        }
        if (type === 'video' && searchArray[voiceChannel.id].length < 5) {
            searchArray[voiceChannel.id].push(resultObj)
        }
        else if (type === 'playlist' && searchPlaylistArray[voiceChannel.id].length < 5) {
            resultObj.plLength = result.length
            searchPlaylistArray[voiceChannel.id].push(resultObj)
        }
    })
    const array = type == 'video' ? searchArray[voiceChannel.id] : searchPlaylistArray[voiceChannel.id]
    return array
}

function toggleLoop(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistArray[userChannel.id] && playlistArray[userChannel.id].length) {
            if (!loopArray[userChannel.id]) {
                loopArray[userChannel.id] = true
                message.channel.send('> Boucle activée !')
            }
            else {
                delete loopArray[userChannel.id]
                message.channel.send('> Boucle désactivée !')
            }
        }
        else {
            message.channel.send('Vous n\'écoutez pas de musique !')
        }
    }
}

function sendSearchResultsAsString(message, voiceChannel, type) {
    const selectedArray = type === 'video' ? searchArray[voiceChannel.id] : searchPlaylistArray[voiceChannel.id]
    if (selectedArray && selectedArray.length) {
        let finalString = ''
        let resultChoices = ''
        selectedArray.map((item, index) => {
            if (item.plLength) {
                resultChoices += '> **' + (index + 1) + '**. ' + item.title + ' (' + item.plLength + ')\n'
            }
            else {
                resultChoices += '> **' + (index + 1) + '**. ' + item.title + '\n'
            }

        })
        if (type === 'video') {
            finalString = `> **Écrivez ou sélectionnez une musique parmi les ${selectedArray.length} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > \n ${resultChoices}`
        }
        else {
            finalString = `> **Écrivez ou sélectionnez une playlist parmi les ${selectedArray.length} ci-dessous.** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`
        }
        message.channel.send(finalString)
            .then(newMessage => addSearchReactions(newMessage))
    }
    else {
        message.channel.send('> Aucune ' + type + ' dans la liste des recherches')
    }

}

function addSearchReactions(message) {
    message.react('1️⃣')
        .then(() => message.react('2️⃣'))
        .then(() => message.react('3️⃣'))
        .then(() => message.react('4️⃣'))
        .then(() => message.react('5️⃣'))
}

function selectSongOrPlaylistInSearchList(message, words) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (words[1] === 'p' || words[1] === 'play') {
        // If there is something after p|play search for the music
        if (words[2]) {
            selectSongInSearchList(message, parseInt(words[2]))
        }
        // If nothing after p|play send the list
        else if (userChannel) {
            sendSearchResultsAsString(message, userChannel, 'video')
        }
        else {
            message.channel.send('Vous devez être connecté dans un salon !')
        }
    }
    else if (words[1] === 'pl' || words[1] === 'playlist') {
        // If there is something after pl|playlist search for the playlist
        if (words[2]) {
            selectSongInSearchList(message, parseInt(words[2]), 'playlist')
        }
        // If nothing after pl|playlist send the list
        else if (userChannel) {
            sendSearchResultsAsString(message, userChannel, 'playlist')
        }
        else {
            message.channel.send('Vous devez être connecté dans un salon !')
        }
    }
    else {
        message.channel.send('Vous devez écrire le type de sélection.```Ex: ' + config.prefix + 'search p```')
    }
}

function selectSongInSearchList(message, number, type = 'musique', byReaction = [false, false]) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (byReaction[0]) {
        userChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1])
    }
    if (userChannel) {
        if (Number.isFinite(parseInt(number))) {
            const choiceArray = type === 'musique' ? searchArray[userChannel.id] : searchPlaylistArray[userChannel.id]
            if (choiceArray && choiceArray.length) {
                if (number >= 1 && number <= choiceArray.length) {
                    const command = type === 'musique' ? 'play' : 'playlist'
                    if (byReaction[0]) {
                        playSongs(message, command, ['useless', choiceArray[number - 1].url], byReaction)
                    }
                    else {
                        playSongs(message, command, ['useless', choiceArray[number - 1].url])
                    }
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
        message.channel.send(`> **Faites un choix parmi les ${countChoices} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`)
    }
    else if (musicExist && !playlistExist) {
        resultChoices += '> **Musiques** \n'
        searchArray[userChannel.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        message.channel.send(`> **Écrivez ou sélectionnez une musique parmi les ${searchArray[userChannel.id].length} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > \n ${resultChoices}`)
            .then(newMessage => addSearchReactions(newMessage))
    }
    else {
        resultChoices += '> **Playlists** \n'
        searchPlaylistArray[userChannel.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        message.channel.send(`> **Écrivez ou sélectionnez une playlist parmi les ${searchPlaylistArray[userChannel.id].length} ci-dessous.** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`)
            .then(newMessage => addSearchReactions(newMessage))
    }
}

function playSong(message, connection, retry = false) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (!retry) {
        sendMusicEmbed(message, playlistInfos[userChannel.id][0].title, playlistInfos[userChannel.id][0].id, [false, 1])
    }
    delete tryToNext[userChannel.id]
    connectionsArray[userChannel.id] = connection
    const stream = ytdl(playlistArray[userChannel.id][0], { filter: 'audio', liveBuffer: 10000 })
    streamsArray[userChannel.id] = connection.play(stream, { highWaterMark: 100 })
    // streamsArray[userChannel.id].setVolume(1)
    streamsArray[userChannel.id].setVolumeDecibels(0.1)
    setTimeout(() => {
        // Check if player is playing when it must be, if not destroy stream and retry to play song
        console.log('------------------')
        console.log('timeout after 3500 in playsong - Check if music stop anormaly')
        if (streamsArray[userChannel.id] && !streamsArray[userChannel.id].player.voiceConnection.speaking.bitfield && !tryToNext[userChannel.id]) {
            if (playlistInfos[userChannel.id]) {
                console.log('STOP ANORMALY -> RETRY SONG')
                streamsArray[userChannel.id].destroy()
                setTimeout(() => {
                    playSong(message, connectionsArray[userChannel.id], true)
                }, 500)
            }
        }
        console.log('--------------------------')
    }, 2000)
    streamsArray[userChannel.id].on('finish', () => {
        setTimeout(() => {
            setArrays(message)
        }, 500)
    })
}

function setArrays(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    // If still connected but the end callback is call to early (after few seconds of playing)
    if (playlistArray[userChannel.id]) {
        // If loop is desactivate
        if (!loopArray[userChannel.id]) {
            delete playlistArray[userChannel.id][0]
            delete playlistInfos[userChannel.id][0]
            playlistArray[userChannel.id] = _.compact(playlistArray[userChannel.id])
            playlistInfos[userChannel.id] = _.compact(playlistInfos[userChannel.id])
        }
        // If playlist is empty
        if (!playlistArray[userChannel.id][0]) {
            waitArray[userChannel.id] = true
            if (loopArray[userChannel.id]) {
                delete loopArray[userChannel.id]
                message.channel.send('> Boucle désactivée')
            }
            message.channel.send('> Plus de musique en file d\'attente')
        }
        else {
            // If loop is activate and command 'next' is called
            if (nextSetLoop[userChannel.id]) {
                loopArray[userChannel.id] = true
                delete nextSetLoop[userChannel.id]
            }
            streamsArray[userChannel.id].destroy()
            setTimeout(() => {
                playSong(message, connectionsArray[userChannel.id])
            }, 500)
        }
    }
}

function sendMusicEmbed(message, musicTitle, musicId, added = [false, 1], type = 'video') {
    const userChannel = Helper.take_user_voiceChannel(message)
    let title = 'Musique'
    let color = false
    let musicLink = musicTitle
    let thumbnail = ''
    if (type === 'video') {
        musicLink = `[${musicTitle}](https://www.youtube.com/watch?v=${musicId})`
    }
    else {
        musicLink = `[${musicTitle}](https://www.youtube.com/playlist?list=${musicId})`
    }
    if (added[0]) {
        if (added[1] > 1) {
            title = 'Playlist ajoutée'
        }
        else {
            title = 'Musique ajoutée'
        }
        // #398240 | Vert foncé
        color = 3768896
    }
    else {
        // #354F94 | Bleu foncé
        color = 3493780
    }
    thumbnail = playlistInfos[userChannel.id][0].thumbnail
    message.channel.send({
        'embed': {
            'footer': {
                'text': '"' + config.prefix + 'p list" pour afficher la file d\'attente'
            },
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
                    'value': `${playlistArray[userChannel.id].length - 1}`,
                    'inline': true
                }
            ]
        }
    })
}

function getPlaylist(voiceChannel, message, words, playSongParams, connection = false) {
    message.channel.send('> Ajout de la playlist en cours ...')
    ytpl(words[1], { limit: 0 }, (err, playlist) => {
        if (playlist) {
            if (playSongParams) {
                voiceChannel.join()
                    .then(conection => {
                        playlistArray[voiceChannel.id] = []
                        playlistInfos[voiceChannel.id] = []
                        connectedGuild[message.guild.id] = voiceChannel.id
                        addPlaylistItems(voiceChannel, message, playlist, conection, playSongParams)
                    })
            }
            else {
                addPlaylistItems(voiceChannel, message, playlist, connection, playSongParams)
            }
        }
        else {
            message.channel.send('Une erreur s\'est produite #2')
        }
    })
}

function addPlaylistItems(voiceChannel, message, playlist, connection, play) {
    let playlistTitle = 'Playlist'
    if (playlist.title) {
        playlistTitle = playlist.title
    }
    if (radioPlayed[voiceChannel.id]) {
        playlistArray[voiceChannel.id] = []
        playlistInfos[voiceChannel.id] = []
        delete radioPlayed[voiceChannel.id]
    }
    pushPlaylistItems(voiceChannel, playlist)
    if (play) {
        sendMusicEmbed(message, playlistTitle, false, [true, playlist.items.length], 'playlist')
        playSong(message, connection)
    }
    else {
        sendMusicEmbed(message, playlistTitle, false, [true, playlist.items.length], 'playlist')
        if (radioPlayed[voiceChannel.id]) {
            streamsArray[voiceChannel.id].destroy()
            delete radioPlayed[voiceChannel.id]
            playSong(message, connectionsArray[voiceChannel.id])
        }
        else if (waitArray[voiceChannel.id]) {
            delete waitArray[voiceChannel.id]
            playSong(message, connectionsArray[voiceChannel.id])
        }
    }
}

function pushPlaylistItems(voiceChannel, playlist) {
    const videoURL = 'https://www.youtube.com/watch?v='
    playlist.items.map(video => {
        if (video.title !== '[Deleted video]') {
            playlistArray[voiceChannel.id].push(videoURL + video.id)
            let thumbnailURL = ''
            if (video.thumbnail) {
                thumbnailURL = video.thumbnail
            }
            playlistInfos[voiceChannel.id].push({
                title: video.title,
                id: video.id,
                thumbnail: thumbnailURL,
                duration: video.duration
            })
        }
    })
}

function getVideo(voiceChannel, message, words, playSongParams = true) {
    ytdl.getBasicInfo(words[1], (err, infos) => {
        if (infos) {
            setMusicArrayAndPlayMusic(voiceChannel, infos, message, playSongParams)
        }
        else {
            message.channel.send('Une erreur s\'est produite')
        }
    })
}

function setMusicArrayAndPlayMusic(voiceChannel, infos, message, playSongParams) {
    if (playSongParams || waitArray[voiceChannel.id]) {
        delete waitArray[voiceChannel.id]
        voiceChannel.join()
            .then(connection => {
                clearAndAddArrayInfos(voiceChannel, infos)
                connectedGuild[message.guild.id] = voiceChannel.id
                playSong(message, connection)
            })
    }
    else if (radioPlayed[voiceChannel.id]) {
        streamsArray[voiceChannel.id].destroy()
        delete radioPlayed[voiceChannel.id]
        clearAndAddArrayInfos(voiceChannel, infos)
        playSong(message, connectionsArray[voiceChannel.id])
    }
    else {
        clearAndAddArrayInfos(voiceChannel, infos, false)
        sendMusicEmbed(message, infos.title, infos.video_id, [true, 1])
    }
}

function clearAndAddArrayInfos(voiceChannel, infos, clear = true) {
    if (clear) {
        playlistArray[voiceChannel.id] = []
        playlistInfos[voiceChannel.id] = []
    }
    playlistArray[voiceChannel.id].push(infos.video_url)
    // console.log('get video : ', infos.player_response)
    playlistInfos[voiceChannel.id].push({
        title: infos.title,
        id: infos.video_id,
        thumbnail: infos.player_response.videoDetails.thumbnail.thumbnails[0].url,
        duration: infos.player_response.videoDetails.lengthSeconds
    })
}

function radioExist(radioCheck) {
    let checkExist = false
    radioAvailable.map(r => {
        if (r.toLowerCase() === radioCheck) {
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
    else if (radioForLink === 'bel-rtl') {
        return 'http://belrtl.ice.infomaniak.ch/belrtl-mp3-128.mp3'
    }
    else if (radioForLink === 'contact') {
        return 'http://broadcast.infomaniak.ch/radiocontact-mp3-192.mp3'
    }
    else if (radioForLink === 'nostalgie-be') {
        return 'http://streamingp.shoutcast.com/NostalgiePremium-mp3'
    }
    else if (radioForLink === 'nostalgie-fr') {
        return 'http://cdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3?origine=fluxradios'
    }
    else if (radioForLink === 'classic21') {
        return 'http://radios.rtbf.be/classic21-128.mp3'
    }
    else if (radioForLink === 'pure-fm') {
        return 'http://radios.rtbf.be/pure-128.mp3'
    }
    else if (radioForLink === 'musiq3') {
        return 'http://radios.rtbf.be/musiq3-128.mp3'
    }
    else if (radioForLink === 'vivacite') {
        return 'http://radios.rtbf.be/vivabxl-128.mp3'
    }
    else if (radioForLink === 'fun-radio') {
        return 'http://streaming.radio.funradio.fr/fun-1-44-128'
    }
    else if (radioForLink === 'rire&chanson') {
        return 'http://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios'
    }
    else if (radioForLink === 'virgin') {
        return 'http://vr-live-mp3-128.scdn.arkena.com/virginradio.mp3'
    }
    else if (radioForLink === 'rfm') {
        return 'http://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3'
    }
    else if (radioForLink === 'rmc') {
        return 'http://rmc.bfmtv.com/rmcinfo-mp3'
    }
    else if (radioForLink === 'bfm-business') {
        return 'http://chai5she.cdn.dvmr.fr/bfmbusiness'
    }
    else if (radioForLink === 'jazz') {
        return 'http://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3'
    }
    else if (radioForLink === 'cherie-fm') {
        return 'http://cdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios'
    }
    else if (radioForLink === 'europe1') {
        return 'http://mp3lg4.tdf-cdn.com/9240/lag_180945.mp3'
    }
    else if (radioForLink === 'rtl') {
        return 'http://streaming.radio.rtl.fr/rtl-1-44-128'
    }
    else if (radioForLink === 'rtl2') {
        return 'http://streaming.radio.rtl2.fr/rtl2-1-44-128'
    }
    else if (radioForLink === 'classique') {
        return 'http://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3'
    }
    else if (radioForLink === 'skyrock') {
        return 'http://www.skyrock.fm/stream.php/tunein16_128mp3.mp3'
    }
    else if (radioForLink === 'france-inter') {
        return 'http://direct.franceinter.fr/live/franceinter-midfi.mp3'
    }
    else if (radioForLink === 'france-culture') {
        return 'http://direct.franceculture.fr/live/franceculture-midfi.mp3'
    }
    else if (radioForLink === 'france-musique') {
        return 'http://direct.francemusique.fr/live/francemusique-midfi.mp3'
    }
    else if (radioForLink === 'france-bleu') {
        return 'http://direct.francebleu.fr/live/fbpicardie-midfi.mp3'
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
        delete tryToNext[voiceChannel.id]
        delete loopArray[voiceChannel.id]
        radioPlayed[voiceChannel.id] = true
        if (!connectedGuild[message.guild.id]) {
            voiceChannel.join()
                .then(connection => {
                    connectionsArray[connection.channel.id] = connection
                    connectedGuild[message.guild.id] = voiceChannel.id
                    streamsArray[connection.channel.id] = connectionsArray[connection.channel.id].play(radioLink)
                    streamsArray[connection.channel.id].setVolume(0.4)
                })
        }
        else if (Helper.verifyBotLocation(message, voiceChannel)) {
            delete playlistArray[voiceChannel.id]
            delete playlistInfos[voiceChannel.id]
            streamsArray[voiceChannel.id].destroy()
            streamsArray[voiceChannel.id] = connectionsArray[voiceChannel.id].play(radioLink)
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
        delete waitArray[userChannel.id]
        delete tryToNext[userChannel.id]
    }
}

function pause(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        streamsArray[userChannel.id].pause(true)
    }
}

function resume(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        streamsArray[userChannel.id].resume()
    }
}

function next(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistArray[userChannel.id]) {
            tryToNext[userChannel.id] = true
            if (loopArray[userChannel.id]) {
                delete loopArray[userChannel.id]
                nextSetLoop[userChannel.id] = true
            }
            streamsArray[userChannel.id].destroy()
            setArrays(message, connectionsArray[userChannel.id])
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
exports.getPlaylistArrayLength = getPlaylistArrayLength
exports.getStreamsBitfieldAndPause = getStreamsBitfieldAndPause