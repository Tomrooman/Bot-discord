const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const ytsr = require('ytsr')
const Helper = require('./helper.js')
const _ = require('lodash')
const config = require('./../../config.json')
const Discord = require('discord.js')

const connectionsArray = []
const streamsArray = []
const playlistArray = []
const playlistInfos = []
const connectedGuild = []
const radioPlayed = []
const searchArray = []
const cancelArray = []
const searchPlaylistArray = []
const searchArrayInfos = []
const searchPlaylistArrayInfos = []
const lastSearchArray = []
const lastSearchPlaylistArray = []
const oldSearchPlaylistArray = []
const oldSearchArray = []
const loopArray = []
const waitArray = []
const nextSetLoop = []
const retryArray = []
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

function playSongs(message, command, words, byReaction = [false, false]) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (byReaction[0]) {
        voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1])
    }
    if (voiceChannel) {
        if (!connectedGuild[message.guild.id]) {
            playSongsAndConnectOrNotBot(message, command, words, true, byReaction)
        }
        else if (connectedGuild[message.guild.id] === voiceChannel.id) {
            playSongsAndConnectOrNotBot(message, command, words, false, byReaction)
        }
        else {
            message.channel.send('> Vous n\'êtes pas dans le même canal que le bot !')
        }
    }
    else {
        message.channel.send('> Vous devez être connecté dans un salon !');
    }
}

function playSongsAndConnectOrNotBot(message, command, words, playSongParams = true, byReaction) {
    if (words[1] && words[1].includes('youtu') && (words[1].includes('http://') || words[1].includes('https://'))) {
        if (command === 'playlist' || command === 'pl') {
            if (ytpl.validateURL(words[1])) {
                getPlaylist(message, words, playSongParams, byReaction)
            }
            else {
                message.channel.send('> Vous devez renseigner une URL de playlist valide !')
            }
        }
        else if (command === 'play' || command === 'p') {
            if (ytdl.validateURL(words[1])) {
                getVideo(message, words, playSongParams, byReaction)
            }
            else {
                message.channel.send('> Ce n\'est pas une URL de vidéo valide !')
            }
        }
    }
    else if (words[1]) {
        delete words[0];
        const title = words.join(' ')
        if (command === 'playlist' || command === 'pl') {
            delete cancelArray[message.guild.id]
            youtubeResearch(message, title, 'playlist')
        }
        else if (command === 'play' || command === 'p') {
            delete cancelArray[message.guild.id]
            youtubeResearch(message, title, 'video')
        }
    }
    else {
        message.channel.send('> Vous n\'avez pas écrit de recherche !')
    }
}

function youtubeResearch(message, title, type, nextPage = false, byReaction = [false, false]) {
    if (searchArray[message.guild.id]) {
        oldSearchArray[message.guild.id] = searchArray[message.guild.id]
    }
    if (searchPlaylistArray[message.guild.id]) {
        oldSearchPlaylistArray[message.guild.id] = searchPlaylistArray[message.guild.id]
    }
    const options = setArrayWithChoice(message, title, type, nextPage, byReaction)
    clearSearchArrays(message, type, byReaction)
    const oldArrayResult = verifyOldResearch(message, type, byReaction)
    if (!oldArrayResult) {
        getYoutubeResearch(message, title, type, options, byReaction)
    }
}

function cancel(message) {
    cancelArray[message.guild.id] = true
}

function sendCurrentResultAndRecall(message, title, type, buildedArray, searchresults, byReaction) {
    message.channel.send('> ' + buildedArray.length + '/5 trouvé')
    setTimeout(() => {
        if (!cancelArray[message.guild.id]) {
            youtubeResearch(message, title, type, searchresults.nextpageRef, byReaction)
        }
        else {
            delete cancelArray[message.guild.id]
            message.channel.send('> Recherche arrêtée !')
        }
    }, 1500)
}

function getYoutubeResearch(message, title, type, options, byReaction) {
    ytsr(title, options, (err, searchresults) => {
        if (searchresults) {
            const buildedArray = makeSearchArray(message, searchresults.items, type)
            if (buildedArray.length < 5 && searchresults.nextpageRef) {
                sendCurrentResultAndRecall(message, title, type, buildedArray, searchresults, byReaction)
            }
            else if (buildedArray.length === 5 || !searchresults.nextpageRef) {
                if (type === 'video') {
                    delete oldSearchArray[message.guild.id]
                }
                else if (type === 'playlist') {
                    delete oldSearchPlaylistArray[message.guild.id]
                }
                setArrayInfos(message, type, title, searchresults)
                sendSearchResultsAsString(message, type)
            }
        }
        else {
            if (type === 'video') {
                searchArray[message.guild.id] = oldSearchArray[message.guild.id]
            }
            else if (type === 'playlist') {
                searchPlaylistArray[message.guild.id] = oldSearchPlaylistArray[message.guild.id]
            }
            message.channel.send('> Aucun résultat obtenu')
            sendSearchResultsAsString(message, type)
        }
    })
}

function verifyOldResearch(message, type, byReaction) {
    if (byReaction[0]) {
        if (type === 'video' && lastSearchArray[message.guild.id].length) {
            delete searchArray[message.guild.id]
            searchArray[message.guild.id] = []
            const lastArray = makeSearchArray(message, lastSearchArray[message.guild.id], 'video', true)
            if (lastArray && lastArray.length === 5) {
                setArrayInfos(message, type, false, { nextPageRef: false })
                sendSearchResultsAsString(message, type)
                return true
            }
            return false
        }
        else if (type === 'playlist' && lastSearchPlaylistArray[message.guild.id].length) {
            delete searchPlaylistArray[message.guild.id]
            searchPlaylistArray[message.guild.id] = []
            const lastPlaylistArray = makeSearchArray(message, lastSearchPlaylistArray[message.guild.id], 'playlist', true)
            if (lastPlaylistArray && lastPlaylistArray.length === 5) {
                setArrayInfos(message, type, false, { nextPageRef: false })
                sendSearchResultsAsString(message, type)
                return true
            }
            return false
        }
    }
    return false
}

function setArrayInfos(message, type, title, searchresults) {
    if (type === 'video') {
        if (searchresults.nextpageRef) {
            searchArray[message.guild.id]['nextpage'] = searchresults.nextpageRef
        }
        if (title) {
            searchArrayInfos[message.guild.id]['title'] = title
            searchArrayInfos[message.guild.id]['count'] = 2
        }
        else {
            searchArrayInfos[message.guild.id]['count']++
        }
    }
    else {
        if (searchresults.nextpageRef) {
            searchPlaylistArray[message.guild.id]['nextpage'] = searchresults.nextpageRef
        }
        if (title) {
            searchPlaylistArrayInfos[message.guild.id]['title'] = title
            searchPlaylistArrayInfos[message.guild.id]['count'] = 2
        }
        else {
            searchPlaylistArrayInfos[message.guild.id]['count']++
        }
    }
}

function clearSearchArrays(message, type, byReaction) {
    if (!byReaction[0]) {
        if (type === 'video') {
            delete searchArrayInfos[message.guild.id]
            delete lastSearchArray[message.guild.id]
            searchArrayInfos[message.guild.id] = []
            lastSearchArray[message.guild.id] = []
        }
        else {
            delete searchPlaylistArrayInfos[message.guild.id]
            delete lastSearchPlaylistArray[message.guild.id]
            searchPlaylistArrayInfos[message.guild.id] = []
            lastSearchPlaylistArray[message.guild.id] = []
        }
    }
}

function setArrayWithChoice(message, title, type, nextPage, byReaction) {
    let nextPageVar = nextPage
    const options = {
        limit: 20
    }
    if (type === 'video' && !nextPage) {
        if (searchArray[message.guild.id]) {
            if (byReaction[0]) {
                nextPageVar = searchArray[message.guild.id]['nextpage']
                message.channel.send('> Recherche de ' + type + ' : ' + '`' + searchArrayInfos[message.guild.id]['title'].trim() + '` #' + searchArrayInfos[message.guild.id]['count'])
            }
            delete searchArray[message.guild.id]
        }
        searchArray[message.guild.id] = []
    }
    else if (type === 'playlist' && !nextPage) {
        if (searchPlaylistArray[message.guild.id]) {
            if (byReaction[0]) {
                nextPageVar = searchPlaylistArray[message.guild.id]['nextpage']
                message.channel.send('> Recherche de ' + type + ' : ' + '`' + searchPlaylistArrayInfos[message.guild.id]['title'].trim() + '` #' + searchPlaylistArrayInfos[message.guild.id]['count'])
            }
            delete searchPlaylistArray[message.guild.id]
        }
        searchPlaylistArray[message.guild.id] = []
    }
    if (!byReaction[0] && !nextPage) {
        const goodTitle = title ? title : type === 'video' ? searchArrayInfos[message.guild.id]['title'] : searchPlaylistArrayInfos[message.guild.id]['title']
        message.channel.send('> Recherche de ' + type + ' : ' + '`' + goodTitle.trim() + '`')
    }
    if (nextPageVar) {
        options.nextpageRef = nextPageVar
    }
    return options
}

function makeSearchArray(message, searchresults, type, verify = false) {
    const filteredResult = searchresults.filter(i => i.type === type && i.title !== '[Deleted video]' && i.title !== '[Private video]')
    if (verify) {
        if (type === 'video') {
            delete lastSearchArray[message.guild.id]
            lastSearchArray[message.guild.id] = []
        }
        else {
            delete lastSearchPlaylistArray[message.guild.id]
            lastSearchPlaylistArray[message.guild.id] = []
        }
    }
    filteredResult.map(result => {
        const resultObj = {
            url: result.link,
            title: result.title
        }
        if (type === 'video' && searchArray[message.guild.id].length < 5) {
            searchArray[message.guild.id].push(resultObj)
        }
        else if (type === 'playlist' && searchPlaylistArray[message.guild.id].length < 5) {
            resultObj.plLength = result.length
            searchPlaylistArray[message.guild.id].push(resultObj)
        }
        else if (type === 'playlist') {
            lastSearchPlaylistArray[message.guild.id].push(result)
        }
        else if (type === 'video') {
            lastSearchArray[message.guild.id].push(result)
        }
    })
    const array = type == 'video' ? searchArray[message.guild.id] : searchPlaylistArray[message.guild.id]
    return array
}

function toggleLoop(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistArray[message.guild.id] && playlistArray[message.guild.id].length) {
            if (!loopArray[message.guild.id]) {
                loopArray[message.guild.id] = true
                message.channel.send('> Boucle activée !')
            }
            else {
                delete loopArray[message.guild.id]
                message.channel.send('> Boucle désactivée !')
            }
        }
        else {
            message.channel.send('> Vous n\'écoutez pas de musique !')
        }
    }
}

function sendSearchResultsAsString(message, type) {
    const selectedArray = type === 'video' ? searchArray[message.guild.id] : searchPlaylistArray[message.guild.id]
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
        .then(() => message.react('⏩'))
}

function selectSongOrPlaylistInSearchList(message, words) {
    if (words[1] === 'p' || words[1] === 'play') {
        // If there is something after p|play search for the music
        if (words[2]) {
            selectSongInSearchList(message, parseInt(words[2]))
        }
        // If nothing after p|play send the list
        else {
            sendSearchResultsAsString(message, 'video')
        }
    }
    else if (words[1] === 'pl' || words[1] === 'playlist') {
        // If there is something after pl|playlist search for the playlist
        if (words[2]) {
            selectSongInSearchList(message, parseInt(words[2]), 'playlist')
        }
        else {
            sendSearchResultsAsString(message, 'playlist')
        }
    }
    else {
        message.channel.send('> Vous devez écrire le type de sélection.```Ex: ' + config.prefix + 'search p```')
    }
}

function selectSongInSearchList(message, number, type = 'musique', byReaction = [false, false]) {
    let userChannel = Helper.take_user_voiceChannel(message)
    if (byReaction[0]) {
        userChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1])
    }
    if (userChannel) {
        if (Number.isFinite(parseInt(number))) {
            const choiceArray = type === 'musique' ? searchArray[message.guild.id] : searchPlaylistArray[message.guild.id]
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
                    message.channel.send(`> Choisissez un chiffre compris entre 1 et ${choiceArray.length}`)
                }
            }
            else {
                message.channel.send(`> Aucune ${type} enregistrée dans la recherche`)
            }
        }
        else {
            message.channel.send('> Vous devez écrire un chiffre après le mot search !')
        }
    }
    else {
        message.channel.send('> Vous devez être connecté dans un salon !')
    }
}

function getSongInSearchList(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (userChannel) {
        const musicExist = searchArray[message.guild.id] && searchArray[message.guild.id].length
        const playlistExist = searchPlaylistArray[message.guild.id] && searchPlaylistArray[message.guild.id].length
        if (musicExist || playlistExist) {
            makeAndSendSearchListArray(message, musicExist, playlistExist)
        }
        else {
            message.channel.send('> Aucune musique enregistrée dans la recherche')
        }
    }
    else {
        message.channel.send('> Vous devez être connecté dans un salon !')
    }
}

function makeAndSendSearchListArray(message, musicExist, playlistExist) {
    let resultChoices = ''
    if (musicExist && playlistExist) {
        resultChoices += '> **Musiques** \n'
        searchArray[message.guild.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        resultChoices += '> \n'
        resultChoices += '> **Playlists** \n'
        searchPlaylistArray[message.guild.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '(' + song.plLength + ')\n'
        })
        const countChoices = searchPlaylistArray[message.guild.id].length + searchArray[message.guild.id].length
        message.channel.send(`> **Faites un choix parmi les ${countChoices} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`)
    }
    else if (musicExist && !playlistExist) {
        resultChoices += '> **Musiques** \n'
        searchArray[message.guild.id].map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
        })
        message.channel.send(`> **Écrivez ou sélectionnez une musique parmi les ${searchArray[message.guild.id].length} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > \n ${resultChoices}`)
            .then(newMessage => addSearchReactions(newMessage))
    }
    else {
        resultChoices += '> **Playlists** \n'
        searchPlaylistArray[message.guild.id].map((song, index) => {
            if (song.plLength) {
                resultChoices += '> **' + (index + 1) + '**. ' + song.title + ' (' + song.plLength + ')\n'
            }
            else {
                resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n'
            }
        })
        message.channel.send(`> **Écrivez ou sélectionnez une playlist parmi les ${searchPlaylistArray[message.guild.id].length} ci-dessous.** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`)
            .then(newMessage => addSearchReactions(newMessage))
    }
}

function playSong(message) {
    if (!retryArray[message.guild.id]) {
        const embedObj = setEmbedObj(playlistInfos[message.guild.id][0].title, playlistInfos[message.guild.id][0].id, playlistInfos[message.guild.id][0].thumbnail, playlistInfos[message.guild.id][0].duration)
        sendMusicEmbed(message, embedObj, [false, 1])
    }
    else {
        delete retryArray[message.guild.id]
    }
    playlistInfos[message.guild.id]['error'] = false
    delete tryToNext[message.guild.id]
    // connectionsArray[userChannel.id] = connection
    const stream = ytdl(playlistArray[message.guild.id][0], { filter: 'audio', liveBuffer: 10000 })
    streamsArray[message.guild.id] = connectionsArray[message.guild.id].play(stream, { highWaterMark: 100 })
    // streamsArray[userChannel.id].setVolume(1)
    streamsArray[message.guild.id].setVolumeDecibels(0.1)
    setTimeout(() => {
        // Check if player is playing when it must be, if not destroy stream and retry to play song
        if (streamsArray[message.guild.id] && !playlistInfos[message.guild.id]['error'] && !streamsArray[message.guild.id].player.voiceConnection.speaking.bitfield && !tryToNext[message.guild.id]) {
            if (playlistInfos[message.guild.id]) {
                console.log('------------------')
                console.log('timeout after 4500 in playsong')
                console.log('titre : ', playlistInfos[message.guild.id][0].title)
                console.log('STOP ANORMALY -> RETRY SONG')
                retryArray[message.guild.id] = true
                // playlistInfos[message.guild.id].splice(1, 0, playlistInfos[message.guild.id][0])
                // playlistArray[message.guild.id].splice(1, 0, playlistArray[message.guild.id][0])
                streamsArray[message.guild.id].destroy()
                playSong(message)
                console.log('--------------------------')
                // message.channel.send('Fais la commande next')
            }
        }
    }, 4500)
    streamsArray[message.guild.id].on('error', (e) => {
        console.log('--------------------------------------')
        console.log('Titre : ', playlistInfos[message.guild.id][0].title)
        playlistInfos[message.guild.id]['error'] = true
        console.log('e message : ', e.message)
        if (e.message.indexOf('This video contains content') !== -1) {
            console.log('Droit d\'auteur')
            message.channel.send('> Vidéo bloquée par droit d\'auteur : `' + playlistInfos[message.guild.id][0].title + '`')
            next(message)
        }
        else {
            console.log('Pas les droit d\'auteur')
            next(message)
        }
        // e.message = 'Cannot call write after a stream was destroyed'
        console.log('--------------------------------------')
        // console.log('contained video : ', e.indexOf('This video contains content'))
    })
    streamsArray[message.guild.id].on('finish', () => {
        setTimeout(() => {
            setArrays(message)
        }, 1500)
    })
}

function setArrays(message) {
    // If still connected but the end callback is call to early (after few seconds of playing)
    if (playlistArray[message.guild.id]) {
        // If loop is desactivate
        if (!loopArray[message.guild.id]) {
            delete playlistArray[message.guild.id][0]
            delete playlistInfos[message.guild.id][0]
            playlistArray[message.guild.id] = _.compact(playlistArray[message.guild.id])
            playlistInfos[message.guild.id] = _.compact(playlistInfos[message.guild.id])
        }
        // If playlist is empty
        if (!playlistArray[message.guild.id][0]) {
            waitArray[message.guild.id] = true
            if (loopArray[message.guild.id]) {
                delete loopArray[message.guild.id]
                message.channel.send('> Boucle désactivée')
            }
            message.channel.send('> Plus de musique en file d\'attente')
        }
        else {
            // If loop is activate and command 'next' is called
            if (nextSetLoop[message.guild.id]) {
                loopArray[message.guild.id] = true
                delete nextSetLoop[message.guild.id]
            }
            streamsArray[message.guild.id].destroy()
            setTimeout(() => {
                playSong(message)
            }, 500)
        }
    }
}

function sendMusicEmbed(message, embedObj, added = [false, 1], type = 'video') {
    let title = 'Musique'
    let color = false
    const queuedLength = playlistArray[message.guild.id].length - 1
    let formattedDuration = 0
    const musicLink = type === 'video' ? `[${embedObj.title}](https://www.youtube.com/watch?v=${embedObj.id})` : `[${embedObj.title}](https://www.youtube.com/playlist?list=${embedObj.id})`
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
        // #543A99 | Mauve
        color = 5520025
    }
    if (playlistArray[message.guild.id].length >= 2) {
        playlistInfos[message.guild.id].map((video, index) => {
            if (index >= 1) {
                addDuration(message, index, video.duration, 'current')
            }
        })
        formattedDuration = convertSecondsToFormattedDuration(playlistArray[message.guild.id]['currentDuration'])
    }
    const embed = new Discord.MessageEmbed()
        .setAuthor(title, 'https://syxbot.com/img/embed_music.png')
        .setColor(color)
        .setFooter('"' + config.prefix + 'p list" pour afficher la file d\'attente')
        .setThumbnail(embedObj.thumbnail)
        .addBlankField(true)
        .addField('Titre', musicLink, true)
        .addField('File d\'attente', queuedLength, true)
        .addBlankField(true)
        .addField('Durée', embedObj.duration, true)
        .addField('Durée en attente', formattedDuration, true)
    message.channel.send({ embed });
}

function getPlaylist(message, words, playSongParams, byReaction) {
    message.channel.send('> Ajout de la playlist en cours ...')
    ytpl(words[1], { limit: 0 }, (err, playlist) => {
        if (playlist) {
            addPlaylistItems(message, playlist, playSongParams, byReaction)
        }
        else {
            message.channel.send('> Une erreur s\'est produite #2')
        }
    })
}

function addPlaylistItems(message, playlist, play, byReaction) {
    let voiceChannel = Helper.take_user_voiceChannel(message)
    if (byReaction[0]) {
        voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1])
    }
    if (radioPlayed[message.guild.id] || play) {
        playlistArray[message.guild.id] = []
        playlistInfos[message.guild.id] = []
        delete radioPlayed[message.guild.id]
    }
    pushPlaylistItems(message, playlist)
    const formattedDuration = convertSecondsToFormattedDuration(playlistArray[message.guild.id]['newPlaylistDuration'])
    const embedObj = setEmbedObj(playlist.title, playlist.id, playlist.items[0].thumbnail, formattedDuration)
    if (play) {
        voiceChannel.join()
            .then(conection => {
                connectedGuild[message.guild.id] = voiceChannel.id
                connectionsArray[message.guild.id] = conection
                sendMusicEmbed(message, embedObj, [true, playlist.items.length], 'playlist')
                playSong(message)
            })
    }
    else {
        sendMusicEmbed(message, embedObj, [true, playlist.items.length], 'playlist')
        if (radioPlayed[message.guild.id]) {
            streamsArray[message.guild.id].destroy()
            delete radioPlayed[message.guild.id]
            playSong(message)
        }
        else if (waitArray[message.guild.id]) {
            delete waitArray[message.guild.id]
            playSong(message)
        }
    }
}

function pushPlaylistItems(message, playlist) {
    const videoURL = 'https://www.youtube.com/watch?v='
    let pushCount = 0;
    playlist.items.map(video => {
        if (video.title !== '[Deleted video]' && video.title !== '[Private video]') {
            pushCount++
            addDuration(message, pushCount, video.duration, 'new')
            playlistArray[message.guild.id].push(videoURL + video.id)
            let thumbnailURL = ''
            if (video.thumbnail) {
                thumbnailURL = video.thumbnail
            }
            playlistInfos[message.guild.id].push({
                title: video.title,
                id: video.id,
                thumbnail: thumbnailURL,
                duration: video.duration
            })
        }
    })
    const deletedVideo = playlist.total_items - pushCount
    if (deletedVideo >= 1) {
        if (deletedVideo === 1) {
            message.channel.send('> ' + deletedVideo + ' vidéo supprimée')
        }
        else {
            message.channel.send('> ' + deletedVideo + ' vidéos supprimées')
        }
    }
}

function convertSecondsToFormattedDuration(duration) {
    const videoDate = new Date(duration * 1000)
    const hours = videoDate.getUTCHours()
    const minutes = videoDate.getUTCMinutes()
    const seconds = videoDate.getUTCSeconds()
    let formatedDuration = ''
    formatedDuration += hours > 0 ? hours.toString() + ':' : ''
    formatedDuration += minutes > 9 ? minutes.toString() + ':' : hours > 0 ? '0' + minutes.toString() + ':' : minutes.toString() + ':'
    formatedDuration += seconds > 9 ? seconds.toString() : '0' + seconds.toString()
    return formatedDuration
}

function addDuration(message, count, duration, type = 'new') {
    if (count === 1) {
        if (type === 'new') {
            playlistArray[message.guild.id]['newPlaylistDuration'] = getSeconds(duration)
        }
        else {
            playlistArray[message.guild.id]['currentDuration'] = getSeconds(duration)
        }
    }
    else if (type === 'new') {
        playlistArray[message.guild.id]['newPlaylistDuration'] += getSeconds(duration)
    }
    else {
        playlistArray[message.guild.id]['currentDuration'] += getSeconds(duration)
    }
}

function getSeconds(duration) {
    const splittedDuration = duration.split(':')
    let resultSeconds = 0
    if (splittedDuration.length === 3) {
        resultSeconds += Number(splittedDuration[0]) * 3600
        resultSeconds += Number(splittedDuration[1]) * 60
        resultSeconds += Number(splittedDuration[2])
    }
    else {
        resultSeconds += Number(splittedDuration[0]) * 60
        resultSeconds += Number(splittedDuration[1])
    }
    return resultSeconds
}

function getVideo(message, words, playSongParams = true, byReaction) {
    ytdl.getBasicInfo(words[1], (err, infos) => {
        if (infos) {
            if (infos.title !== '[Deleted video]' && infos.title !== '[Private video]') {
                setMusicArrayAndPlayMusic(infos, message, playSongParams, byReaction)
            }
            else {
                message.channel.send('> Cette vidéo n\'est pas disponible !')
            }
        }
        else {
            message.channel.send('> Une erreur s\'est produite')
        }
    })
}

function setMusicArrayAndPlayMusic(infos, message, playSongParams, byReaction) {
    if (playSongParams || waitArray[message.guild.id]) {
        delete waitArray[message.guild.id]
        let voiceChannel = Helper.take_user_voiceChannel(message)
        if (byReaction[0]) {
            voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1])
        }
        voiceChannel.join()
            .then(connection => {
                clearAndAddArrayInfos(message, infos)
                connectedGuild[message.guild.id] = voiceChannel.id
                connectionsArray[message.guild.id] = connection
                playSong(message)
            })
    }
    else if (radioPlayed[message.guild.id]) {
        streamsArray[message.guild.id].destroy()
        delete radioPlayed[message.guild.id]
        clearAndAddArrayInfos(message, infos)
        playSong(message)
    }
    else {
        const formattedDuration = clearAndAddArrayInfos(message, infos, false)
        const embedObj = setEmbedObj(infos.title, infos.video_id, infos.player_response.videoDetails.thumbnail.thumbnails[0].url, formattedDuration)
        sendMusicEmbed(message, embedObj, [true, 1])
    }
}

function setEmbedObj(title, id, thumbnail, duration) {
    return {
        title: title,
        id: id,
        thumbnail: thumbnail,
        duration: duration
    }
}

function clearAndAddArrayInfos(message, infos, clear = true) {
    if (clear) {
        playlistArray[message.guild.id] = []
        playlistInfos[message.guild.id] = []
    }
    playlistArray[message.guild.id].push(infos.video_url)
    const formattedDuration = convertSecondsToFormattedDuration(infos.player_response.videoDetails.lengthSeconds)
    playlistInfos[message.guild.id].push({
        title: infos.title,
        id: infos.video_id,
        thumbnail: infos.player_response.videoDetails.thumbnail.thumbnails[0].url,
        duration: formattedDuration
    })
    return formattedDuration
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
    if (words[1]) {
        if (words[1].toLowerCase() === 'list') {
            showRadioList(message)
        }
        else if (radioExist(words[1].toLowerCase())) {
            connectRadio(message, words)
        }
        else {
            message.channel.send('> **Cette radio n\'existe pas !** \n > Tapez **' + config.prefix + 'radio list** pour obtenir la liste des radios disponibles.')
        }
    }
    else {
        message.channel.send('> Choisir une radio, c\'est mieux !')
    }
}

function connectRadio(message, words) {
    const radioLink = getRadioLink(words[1].toLowerCase())
    const voiceChannel = Helper.take_user_voiceChannel(message)
    if (voiceChannel) {
        delete tryToNext[message.guild.id]
        delete loopArray[message.guild.id]
        radioPlayed[message.guild.id] = true
        if (!connectedGuild[message.guild.id]) {
            voiceChannel.join()
                .then(connection => {
                    connectionsArray[message.guild.id] = connection
                    connectedGuild[message.guild.id] = voiceChannel.id
                    streamsArray[message.guild.id] = connectionsArray[message.guild.id].play(radioLink)
                    streamsArray[message.guild.id].setVolume(0.4)
                })
        }
        else if (Helper.verifyBotLocation(message, voiceChannel)) {
            delete playlistArray[message.guild.id]
            delete playlistInfos[message.guild.id]
            streamsArray[message.guild.id].destroy()
            streamsArray[message.guild.id] = connectionsArray[message.guild.id].play(radioLink)
            streamsArray[message.guild.id].setVolume(0.4)
        }
    }
    else {
        message.channel.send('> Vous devez être connecté dans un salon !')
    }
}

function getConnectedGuild(guildID) {
    if (connectedGuild[guildID]) {
        return connectedGuild[guildID]
    }
    return false
}

function getSongInPlaylist(message, number) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistInfos[message.guild.id].length) {
            if (number > 0 && number <= playlistInfos[message.guild.id].length) {
                // Add selected music at the top of the list
                playlistInfos[message.guild.id].splice(1, 0, playlistInfos[message.guild.id][number])
                playlistArray[message.guild.id].splice(1, 0, playlistArray[message.guild.id][number])
                // Remove selected music from where we copy it (+1 because we add an item before)
                delete playlistInfos[message.guild.id][number + 1]
                delete playlistArray[message.guild.id][number + 1]
                // Add the current music after the selected one
                playlistInfos[message.guild.id].splice(2, 0, playlistInfos[message.guild.id][0])
                playlistArray[message.guild.id].splice(2, 0, playlistArray[message.guild.id][0])
                // Destroy stream that call end callback (next song)
                streamsArray[message.guild.id].destroy()
            }
            else {
                let howToSay = 'chiffre'
                if (playlistInfos[message.guild.id].length >= 10) {
                    howToSay = 'nombre'
                }
                message.channel.send(`> Choisissez un ${howToSay} compris entre 1 et ${playlistInfos[message.guild.id].length} - 1`)
            }
        }
        else {
            message.channel.send('> Aucune musique dans la file d\'attente')
        }
    }
}

function showQueuedSongs(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistInfos[message.guild.id] && playlistInfos[message.guild.id].length >= 2) {
            // Create songs array and send multiple message if needed (max message length to 2000)
            createSongsString(message).map((list, index) => {
                if (index === 0) {
                    if (playlistInfos[message.guild.id].length >= 3) {
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
            message.channel.send('> Aucune musique dans la file d\'attente')
        }
    }
}

function createSongsString(message) {
    const songsArray = []
    let songs = ''
    playlistInfos[message.guild.id].map((music, index) => {
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

function removeSelectedSongsMaster(message, words) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (userChannel) {
        if (Helper.verifyBotLocation(message, userChannel)) {
            if (playlistArray[message.guild.id] && playlistArray[message.guild.id].length) {
                if (words[2]) {
                    const selection = words[2].split('-')
                    if (selection.length <= 2) {
                        removeSelectedSongs(message, selection)
                    }
                    else {
                        message.channel.send('> Veuillez n\'écrire que 2 index maximum.```Ex: ' + config.prefix + 'p remove 15-20```')
                    }
                }
                else {
                    message.channel.send('> Vous devez sélectionner la/les musique(s) à supprimé')
                }
            }
            else {
                message.channel.send('> Aucune musique dans la file d\'attente')
            }
        }
    }
    else {
        message.channel.send('> Vous devez être connecté dans un salon !')
    }

}

function removeSelectedSongs(message, selection) {
    const selectZero = Number(selection[0])
    if (selection[1]) {
        const selectOne = Number(selection[1])
        if (selectOne && selectZero && selectZero < selectOne) {
            if (selectZero > 0 && selectOne < playlistArray[message.guild.id].length) {
                for (let i = selectZero; i <= selectOne; i++) {
                    delete playlistInfos[message.guild.id][i]
                    delete playlistArray[message.guild.id][i]
                }
                playlistArray[message.guild.id] = _.compact(playlistArray[message.guild.id])
                playlistInfos[message.guild.id] = _.compact(playlistInfos[message.guild.id])
                sendRemoveEmbed(message, (selectOne - selectZero) + 1)
            }
            else {
                message.channel.send('> Sélectionnez des musiques compris entre 1 et ' + playlistArray[message.guild.id].length - 1)
            }
        }
        else {
            message.channel.send('> Le 2ème index doit être plus grand que le premier !')
        }
    }
    else if (selectZero && selectZero > 0) {
        delete playlistInfos[message.guild.id][selectZero]
        delete playlistArray[message.guild.id][selectZero]
        playlistArray[message.guild.id] = _.compact(playlistArray[message.guild.id])
        playlistInfos[message.guild.id] = _.compact(playlistInfos[message.guild.id])
        sendRemoveEmbed(message, 1)
    }
    else {
        message.channel.send('> Sélectionnez une musique compris entre 1 et ' + playlistArray[message.guild.id].length - 1)
    }
}

function go(message, words) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (userChannel) {
        if (Helper.verifyBotLocation(message, userChannel)) {
            if (words[1] && Number(words[1])) {
                const number = Number(words[1])
                if (playlistArray[message.guild.id] && playlistArray[message.guild.id].length) {
                    if (number > 0 && number < playlistArray[message.guild.id].length) {
                        streamsArray[message.guild.id].destroy()
                        for (let i = 0; i < number; i++) {
                            delete playlistInfos[message.guild.id][i]
                            delete playlistArray[message.guild.id][i]
                        }
                        playlistArray[message.guild.id] = _.compact(playlistArray[message.guild.id])
                        playlistInfos[message.guild.id] = _.compact(playlistInfos[message.guild.id])
                        sendRemoveEmbed(message, number)
                        playSong(message)
                    }
                    else {
                        message.channel.send('> Sélectionnez une musique compris entre 1 et ' + playlistArray[message.guild.id].length - 1)
                    }
                }
                else {
                    message.channel.send('> Aucune musique dans la file d\'attente')
                }
            }
            else {
                message.channel.send('> Sélectionnez l\'index d\'une musique.```Ex: ' + config.prefix + 'go 12```')
            }
        }
    }
    else {
        message.channel.send('> Vous devez être connecté dans un salon !')
    }
}

function sendRemoveEmbed(message, number) {
    const title = number > 1 ? 'Musiques supprimées' : 'Musique supprimée'
    const queuedLength = playlistArray[message.guild.id].length - 1
    // #952716 | Rouge | Decimal value
    const color = 9774870
    message.channel.send({
        'embed': {
            'color': color,
            'author': {
                'name': title,
                'icon_url': 'https://syxbot.com/img/removed_music.png'
            },
            'fields': [
                {
                    'name': 'Nombre',
                    'value': number,
                    'inline': true
                },
                {
                    'name': 'File d\'attente',
                    'value': queuedLength,
                    'inline': true
                }
            ]
        }
    })
}

function quit(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        connectionsArray[message.guild.id].channel.leave()
        delete connectionsArray[message.guild.id]
        delete streamsArray[message.guild.id]
        delete playlistArray[message.guild.id]
        delete playlistInfos[message.guild.id]
        delete connectedGuild[message.guild.id]
        delete radioPlayed[message.guild.id]
        delete loopArray[message.guild.id]
        delete waitArray[message.guild.id]
        delete tryToNext[message.guild.id]
    }
}

function pause(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        streamsArray[message.guild.id].pause(true)
    }
}

function resume(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        streamsArray[message.guild.id].resume()
    }
}

function next(message) {
    const userChannel = Helper.take_user_voiceChannel(message)
    if (Helper.verifyBotLocation(message, userChannel)) {
        if (playlistArray[message.guild.id]) {
            tryToNext[message.guild.id] = true
            if (loopArray[message.guild.id]) {
                delete loopArray[message.guild.id]
                nextSetLoop[message.guild.id] = true
            }
            streamsArray[message.guild.id].destroy()
            setArrays(message, connectionsArray[message.guild.id])
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
exports.getSongInPlaylist = getSongInPlaylist
exports.selectSongInSearchList = selectSongInSearchList
exports.getSongInSearchList = getSongInSearchList
exports.toggleLoop = toggleLoop
exports.selectSongOrPlaylistInSearchList = selectSongOrPlaylistInSearchList
exports.getConnectedGuild = getConnectedGuild
exports.youtubeResearch = youtubeResearch
exports.removeSelectedSongsMaster = removeSelectedSongsMaster
exports.go = go
exports.cancel = cancel