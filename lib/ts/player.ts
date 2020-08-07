'use strict';

import ytdl from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr, { Item } from 'ytsr';
import * as Helper from './helper';
import * as Settings from './settings';
import _ from 'lodash';
import config from '../../config.json';
import Discord, { VoiceChannel, VoiceConnection, StreamDispatcher, Message, User, PartialUser } from 'discord.js';
import { playlistArrayType, playlistInfosType, musicParamsType, searchVideoType, searchVideoArrayType, searchVideosInfosType, embedObjType } from '../@types/player';

const connectionsArray: VoiceConnection[] = [];
const streamsArray: StreamDispatcher[] = [];
const playlistArray: playlistArrayType[] = [];
const playlistInfos: playlistInfosType[][] = [];
const connectedGuild: string[] = [];
const radioPlayed: boolean[] = [];
const musicParams: musicParamsType = { 'cancel': [], 'loop': [], 'wait': [], 'nextSetLoop': [], 'tryToNext': [] };
const searchVideo: searchVideoType[] = [];
const searchPlaylist: searchVideoType[] = [];

export const instantiate = (message: Message = {} as Message, command: string | boolean = false, words: string[] = []): void | Promise<void | Message> => {
    // Check command and call function if args in new instance
    if (message && message.content.length) {
        if (words[1] && words[1] === 'go') {
            delete words[1];
            words = _.compact(words);
            return go(message, words);
        }
        if (words[1] && words[1] === 'list') {
            return showQueuedSongs(message);
        }
        if (words[1] && (words[1] === 'r' || words[1] === 'remove')) {
            return removeSelectedSongsMaster(message, words);
        }
        if (words[1] && Number.isFinite(parseInt(words[1]))) {
            return getSongInPlaylist(message, parseInt(words[1]));
        }
        return playSongs(message as Message, command as string, words);
    }
};

export const removeArray = (message: Message, choice: string): void => {
    // Call without instance and remove selected array
    if (choice === 'loop') {
        delete musicParams.loop[Number(message.guild?.id)];
    }
    else if (choice === 'trytonext') {
        delete musicParams.tryToNext[Number(message.guild?.id)];
    }
    else if (choice === 'playlistArray') {
        delete playlistArray[Number(message.guild?.id)];
    }
    else if (choice === 'playlistInfos') {
        delete playlistInfos[Number(message.guild?.id)];
    }
};

export const getArray = (message: Message, choice: string): string | VoiceConnection | undefined => {
    // Call without instance and return selected array
    let object;
    if (choice === 'connections') {
        object = connectionsArray[Number(message.guild?.id)];
    }
    else if (choice === 'connected') {
        object = connectedGuild[Number(message.guild?.id)];
    }
    return object;
};

export const setArray = (message: Message, choice: string, value: any): void => {
    // Call without instance and set selected array with 'value'
    if (choice === 'radio') {
        radioPlayed[Number(message.guild?.id)] = value;
    }
    else if (choice === 'connections') {
        connectionsArray[Number(message.guild?.id)] = value;
    }
    else if (choice === 'connected') {
        connectedGuild[Number(message.guild?.id)] = value;
    }
    else if (choice === 'streams') {
        streamsArray[Number(message.guild?.id)] = value;
    }
};

export const streamDestroy = (message: Message): void => {
    // Call without instance and destroy the stream
    streamsArray[Number(message.guild?.id)].destroy();
};

const playSongs = (message: Message, command: string, words: string[], byReaction: [boolean, User | PartialUser] = [false, {} as User]): void | Promise<Message | void> => {
    let voiceChannel = Helper.take_user_voiceChannel(message);
    if (byReaction[0]) {
        // If call by reaction get voice channel with good function
        voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1]);
    }
    if (voiceChannel) {
        // If user is connected in voice channel
        if (!connectedGuild[Number(message.guild?.id)]) {
            // If bot is not connected in voice channel
            return playSongsAndConnectOrNotBot(message, command, words, true, byReaction);
        }
        if (connectedGuild[Number(message.guild?.id)] === voiceChannel.id) {
            // If bot is connected in the same voice channel as the user
            return playSongsAndConnectOrNotBot(message, command, words, false, byReaction);
        }
        return message.channel.send('❌ Vous n\'êtes pas dans le même canal que le bot !');
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

const playSongsAndConnectOrNotBot = (message: Message, command: string, words: string[], playSongParams = true, byReaction: [boolean, User | PartialUser]): void | Promise<void | Message> => {
    if (words[1] && words[1].includes('youtu') && (words[1].includes('http://') || words[1].includes('https://'))) {
        // If words[1] (element after the command) exist and contain 'youtu' + 'http://' or 'https://'
        if (command === 'playlist' || command === 'pl') {
            if (ytpl.validateURL(words[1])) {
                // Check playlist url before continue
                return getPlaylist(message, words, playSongParams, byReaction);
            }
            return message.channel.send('❌ Vous devez renseigner une URL de playlist valide !');
        }
        else if (command === 'play' || command === 'p') {
            if (ytdl.validateURL(words[1])) {
                // Check video url before continue
                return getVideo(message, words, playSongParams, byReaction);
            }
            return message.channel.send('❌ Ce n\'est pas une URL de vidéo valide !');
        }
    }
    else if (words[1]) {
        // If words[1] (element after the command) exist and DO NOT CONTAIN 'youtu' + 'http://' or 'https://'
        delete words[0];
        const title = words.join(' ');
        // Delete cancel array who said to 'sendCurrentResultAndRecall()' to stop research
        if (command === 'playlist' || command === 'pl') {
            delete musicParams.cancel[Number(message.guild?.id)];
            youtubeResearch(message, title, 'playlist');
        }
        else if (command === 'play' || command === 'p') {
            delete musicParams.cancel[Number(message.guild?.id)];
            youtubeResearch(message, title, 'video');
        }
    }
    return message.channel.send('❌ Vous n\'avez pas écrit de recherche !');
};

export const youtubeResearch = (message: Message, title: string | null, type: string, nextPage: string | boolean = false, byReaction: [boolean, User] = [false, {} as User]): void => {
    // Create array if it doesn't exist
    if (!searchVideo[Number(message.guild?.id)]) {
        searchVideo[Number(message.guild?.id)] = [] as searchVideoType;
    }
    if (!searchPlaylist[Number(message.guild?.id)]) {
        searchPlaylist[Number(message.guild?.id)] = [] as searchVideoType;
    }
    // Save current result in 'old' array in case of no API results when try to go to the next page
    if (type === 'video' && searchVideo[Number(message.guild?.id)]['array']) {
        searchVideo[Number(message.guild?.id)]['old'] = searchVideo[Number(message.guild?.id)]['array'];
    }
    if (type === 'playlist' && searchPlaylist[Number(message.guild?.id)]['array']) {
        searchPlaylist[Number(message.guild?.id)]['old'] = searchPlaylist[Number(message.guild?.id)]['array'];
    }
    // Create search arrays and set options for the API call
    const options = setArrayWithChoice(message, title as string, type, nextPage, byReaction);
    // Clear 'infos' and 'last' array
    clearSearchArrays(message, type, byReaction);
    // Try to get 5 next results in last research array and call API if results < 5
    const oldArrayResult = verifyOldResearch(message, type, byReaction);
    if (!oldArrayResult) {
        getYoutubeResearch(message, title as string, type, options, byReaction);
    }
};

export const cancel = (message: Message): void => {
    // Set cancel array to tell the API to stop the research
    musicParams.cancel[Number(message.guild?.id)] = true;
};

const sendCurrentResultAndRecall = (message: Message, title: string, type: string, buildedArray: searchVideoArrayType[], searchresults: ytsr.Result, byReaction: [boolean, User]): void => {
    message.channel.send('✅ ' + buildedArray.length + '/5 trouvé');
    setTimeout(() => {
        // If cancel is activate stop the research
        if (!musicParams.cancel[Number(message.guild?.id)]) {
            youtubeResearch(message, title, type, searchresults.nextpageRef, byReaction);
        }
        else {
            delete musicParams.cancel[Number(message.guild?.id)];
            message.channel.send('❌ Recherche arrêtée !');
        }
    }, 1500);
};

const getYoutubeResearch = (message: Message, title: string, type: string, options: ytsr.Options, byReaction: [boolean, User]): void => {
    ytsr(title, options, (err, searchresults) => {
        if (searchresults) {
            const buildedArray = makeSearchArray(message, searchresults.items, type);
            if ((buildedArray as searchVideoArrayType[]).length < 5 && searchresults.nextpageRef) {
                // If results is less than 5 so recall API
                sendCurrentResultAndRecall(message, title, type, buildedArray, searchresults, byReaction);
            }
            else if ((buildedArray as searchVideoArrayType[]).length === 5 || !searchresults.nextpageRef) {
                // If get 5 results send them
                if (type === 'video') {
                    delete searchVideo[Number(message.guild?.id)]['old'];
                }
                else if (type === 'playlist') {
                    delete searchPlaylist[Number(message.guild?.id)]['old'];
                }
                setArrayInfos(message, type, title, searchresults);
                sendSearchResultsAsString(message, type);
            }
        }
        else {
            // If no results send the last research results
            if (type === 'video') {
                searchVideo[Number(message.guild?.id)]['array'] = searchVideo[Number(message.guild?.id)]['old'];
            }
            else if (type === 'playlist') {
                searchPlaylist[Number(message.guild?.id)]['array'] = searchPlaylist[Number(message.guild?.id)]['old'];
            }
            message.channel.send('❌ Aucun résultat obtenu');
            sendSearchResultsAsString(message, type);
        }
    });
};

const verifyOldResearch = (message: Message, type: string, byReaction: [boolean, User]): boolean => {
    if (byReaction[0]) {
        // If activate by reaction (button next)
        if (type === 'video' && (searchVideo[Number(message.guild?.id)]['last'] as Item[]).length) {
            // Delete current results and try to get 5 next results in saved results
            delete searchVideo[Number(message.guild?.id)]['array'];
            searchVideo[Number(message.guild?.id)]['array'] = [] as searchVideoArrayType[];
            const lastArray: searchVideoArrayType | searchVideoArrayType[] = makeSearchArray(message, searchVideo[Number(message.guild?.id)]['last'], 'video', true);
            if (lastArray && lastArray.length === 5) {
                setArrayInfos(message, type, false, { nextpageRef: false });
                sendSearchResultsAsString(message, type);
                return true;
            }
            return false;
        }
        else if (type === 'playlist' && (searchPlaylist[Number(message.guild?.id)]['last'] as searchVideoType[]).length) {
            // Delete current results and try to get 5 next results in saved results
            delete searchPlaylist[Number(message.guild?.id)]['array'];
            searchPlaylist[Number(message.guild?.id)]['array'] = [];
            const lastPlaylistArray = makeSearchArray(message, searchPlaylist[Number(message.guild?.id)]['last'], 'playlist', true);
            if (lastPlaylistArray && lastPlaylistArray.length === 5) {
                setArrayInfos(message, type, false, { nextpageRef: false });
                sendSearchResultsAsString(message, type);
                return true;
            }
            return false;
        }
    }
    return false;
};

const setArrayInfos = (message: Message, type: string, title: string | boolean, searchresults: ytsr.Result | { nextpageRef: boolean }): void => {
    // Set research number with title and nextPage token
    if (type === 'video') {
        if (searchresults.nextpageRef) {
            (searchVideo[Number(message.guild?.id)]['array'] as any)['nextpage'] = searchresults.nextpageRef;
        }
        if (title) {
            (searchVideo[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['title'] = String(title);
            (searchVideo[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['count'] = 2;
        }
        else {
            (searchVideo[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['count']++;
        }
    }
    else {
        if (searchresults.nextpageRef) {
            (searchPlaylist[Number(message.guild?.id)]['array'] as any)['nextpage'] = searchresults.nextpageRef;
        }
        if (title) {
            (searchPlaylist[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['title'] = String(title);
            (searchPlaylist[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['count'] = 2;
        }
        else {
            (searchPlaylist[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['count']++;
        }
    }
};

const clearSearchArrays = (message: Message, type: string, byReaction: [boolean, User]): void => {
    if (!byReaction[0]) {
        // If by reaction clear 'infos' and 'last' array
        if (type === 'video') {
            delete searchVideo[Number(message.guild?.id)]['infos'];
            delete searchVideo[Number(message.guild?.id)]['last'];
            searchVideo[Number(message.guild?.id)]['infos'] = {} as searchVideosInfosType;
            searchVideo[Number(message.guild?.id)]['last'] = [];
        }
        else {
            delete searchPlaylist[Number(message.guild?.id)]['infos'];
            delete searchPlaylist[Number(message.guild?.id)]['last'];
            searchPlaylist[Number(message.guild?.id)]['infos'] = {} as searchVideosInfosType;
            searchPlaylist[Number(message.guild?.id)]['last'] = [];
        }
    }
};

const setArrayWithChoice = (message: Message, title: string, type: string, nextPage: string | boolean, byReaction: [boolean, User]): { limit: number, nextpageRef?: string } => {
    let nextPageVar = nextPage;
    const options: { limit: number, nextpageRef?: string } = {
        limit: 20
    };
    if (!nextPage) {
        const selectedArray = type === 'video' ? searchVideo[Number(message.guild?.id)] : searchPlaylist[Number(message.guild?.id)];
        if (selectedArray['array']) {
            // Don't have nextPage and have elements in video array so clear it and set nextPage token
            if (byReaction[0]) {
                nextPageVar = (selectedArray['array'] as any)['nextpage'];
                message.channel.send('🔎 Recherche de ' + type + ' : ' + '`' + (selectedArray['infos'] as searchVideosInfosType)['title'].trim() + '` #' + (selectedArray['infos'] as searchVideosInfosType)['count']);
            }
            delete selectedArray['array'];
        }
        selectedArray['array'] = [];
    }
    if (!byReaction[0] && !nextPage) {
        // If no reaction and no nextPage send message
        const goodTitle = title ? title : type === 'video' ? (searchVideo[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['title'] : (searchPlaylist[Number(message.guild?.id)]['infos'] as searchVideosInfosType)['title'];
        message.channel.send('🔎 Recherche de ' + type + ' : ' + '`' + goodTitle.trim() + '`');
    }
    if (nextPageVar) {
        // Save the nextPage token if user use next reaction
        options.nextpageRef = String(nextPageVar);
    }
    return options;
};

const clearLastArray = (type: string, message: Message) => {
    if (type === 'video') {
        delete searchVideo[Number(message.guild?.id)]['last'];
        searchVideo[Number(message.guild?.id)]['last'] = [];
    }
    else {
        delete searchPlaylist[Number(message.guild?.id)]['last'];
        searchPlaylist[Number(message.guild?.id)]['last'] = [];
    }
};

const makeSearchArray = (message: Message, searchresults: any, type: string, verify: boolean = false): searchVideoArrayType[] => {
    // Get available results
    const filteredResult = searchresults.filter((i: any) => i.type === type && i.title !== '[Deleted video]' && i.title !== '[Private video]');
    if (verify) {
        clearLastArray(type, message);
    }
    filteredResult.map((result: any) => {
        // If selected array length < 5 push element in it ELSE push in last array for the next page
        const resultObj: { url: string, title: string, plLength?: number } = {
            url: result.link,
            title: result.title
        };
        if (type === 'video' && (searchVideo[Number(message.guild?.id)]['array'] as searchVideoType[]).length < 5) {
            (searchVideo[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).push(resultObj);
        }
        else if (type === 'playlist' && (searchPlaylist[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length < 5) {
            resultObj.plLength = result.length;
            (searchPlaylist[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).push(resultObj);
        }
        else if (type === 'playlist') {
            (searchPlaylist[Number(message.guild?.id)]['last'] as searchVideoType[]).push(result);
        }
        else if (type === 'video') {
            (searchVideo[Number(message.guild?.id)]['last'] as searchVideoType[]).push(result);
        }
    });
    const array = type == 'video' ? searchVideo[Number(message.guild?.id)]['array'] : searchPlaylist[Number(message.guild?.id)]['array'];
    return array as searchVideoArrayType[];
};

export const toggleLoop = (message: Message): undefined | Promise<Message> => {
    // Call without instance and activate or desactivate repeat mode
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if (playlistArray[Number(message.guild?.id)] && playlistArray[Number(message.guild?.id)]['url'].length) {
            if (!musicParams.loop[Number(message.guild?.id)]) {
                musicParams.loop[Number(message.guild?.id)] = true;
                return message.channel.send('🔄 Mode répétition activé !');
            }
            delete musicParams.loop[Number(message.guild?.id)];
            return message.channel.send('▶️ Mode répétition désactivé !');
        }
        return message.channel.send('❌ Vous n\'écoutez pas de musique !');
    }
};

const sendSearchResultsAsString = (message: Message, type: string): void | Promise<Message> => {
    // Create string with search results array and send it
    const selectedArray = type === 'video' ? searchVideo[Number(message.guild?.id)]['array'] : searchPlaylist[Number(message.guild?.id)]['array'];
    if (selectedArray && selectedArray.length) {
        let finalString = '';
        const resultChoices = makeSearchVideoOrPlaylistString(message, type);
        if (type === 'video') {
            finalString = `> **Écrivez ou sélectionnez une musique ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > \n ${resultChoices}`;
        }
        else {
            finalString = `> **Écrivez ou sélectionnez une playlist ci-dessous.** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`;
        }
        message.channel.send(finalString)
            .then(newMessage => addSearchReactions(newMessage));
        return;
    }
    return message.channel.send('❌ Aucune ' + type + ' dans la liste des recherches');
};

const addSearchReactions = (message: Message): void => {
    message.react('1️⃣')
        .then(() => message.react('2️⃣'))
        .then(() => message.react('3️⃣'))
        .then(() => message.react('4️⃣'))
        .then(() => message.react('5️⃣'))
        .then(() => message.react('⏩'));
};

export const selectSongOrPlaylistInSearchList = (message: Message, words: string[]): void | Promise<void | Message> => {
    if (words[1] === 'p' || words[1] === 'play') {
        // If there is something after p|play search for the music
        if (words[2]) {
            return selectSongInSearchList(message, parseInt(words[2]));
        }
        // If nothing after p|play send the list
        return sendSearchResultsAsString(message, 'video');
    }
    else if (words[1] === 'pl' || words[1] === 'playlist') {
        // If there is something after pl|playlist search for the playlist
        if (words[2]) {
            return selectSongInSearchList(message, parseInt(words[2]), 'playlist');
        }
        return sendSearchResultsAsString(message, 'playlist');
    }
    return message.channel.send('❌ Vous devez écrire le type de sélection.```Ex: ' + config.prefix + 'search p```');
};

export const selectSongInSearchList = (message: Message, number: number | false, type = 'musique', byReaction: [boolean, User | PartialUser] = [false, {} as User]): void | Promise<Message | void> => {
    let userChannel = Helper.take_user_voiceChannel(message);
    if (byReaction[0]) {
        userChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1]);
    }
    if (userChannel) {
        if (Number.isFinite(number)) {
            const choiceArray = type === 'musique' ? searchVideo[Number(message.guild?.id)]['array'] : searchPlaylist[Number(message.guild?.id)]['array'];
            if (choiceArray && choiceArray.length) {
                if (number >= 1 && number <= choiceArray.length) {
                    const command = type === 'musique' ? 'play' : 'playlist';
                    // Play the selected song with verif number and not too low or higher
                    if (byReaction[0]) {
                        return playSongs(message, command, ['useless', choiceArray[number as number - 1].url], byReaction);
                    }
                    return playSongs(message, command, ['useless', choiceArray[number as number - 1].url]);
                }
                return message.channel.send(`❌ Choisissez un chiffre compris entre 1 et ${choiceArray.length}`);
            }
            return message.channel.send(`❌ Aucune ${type} enregistrée dans la recherche`);
        }
        return message.channel.send('❌ Vous devez écrire un chiffre après le mot search !');
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

export const getSongInSearchList = (message: Message): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (userChannel) {
        const musicExist = searchVideo[Number(message.guild?.id)]['array'] && (searchVideo[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length;
        const playlistExist = searchPlaylist[Number(message.guild?.id)]['array'] && (searchPlaylist[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length;
        if (musicExist || playlistExist) {
            return makeAndSendSearchListArray(message, !!musicExist, !!playlistExist);
        }
        return message.channel.send('❌ Aucune musique enregistrée dans la recherche');
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

const makeAndSendSearchListArray = (message: Message, musicExist: boolean, playlistExist: boolean): void => {
    let resultChoices = '';
    if (musicExist && playlistExist) {
        // Send music and playlist array as string
        resultChoices += makeSearchVideoOrPlaylistString(message, 'video');
        resultChoices += '> \n';
        resultChoices += makeSearchVideoOrPlaylistString(message, 'playlist');
        const countChoices = (searchPlaylist[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length + (searchVideo[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length;
        message.channel.send(`> **Faites un choix parmi les ${countChoices} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`);
    }
    else if (musicExist && !playlistExist) {
        // Send music array as string and add reaction for selection
        resultChoices += makeSearchVideoOrPlaylistString(message, 'video');
        message.channel.send(`> **Écrivez ou sélectionnez une musique parmi les ${(searchVideo[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length} ci-dessous.** \n > **Ex: ${config.prefix}search p 2** \n > \n ${resultChoices}`)
            .then(newMessage => addSearchReactions(newMessage));
    }
    else {
        // Send playlist array as string and add reaction for selection
        resultChoices += makeSearchVideoOrPlaylistString(message, 'playlist');
        message.channel.send(`> **Écrivez ou sélectionnez une playlist parmi les ${(searchPlaylist[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).length} ci-dessous.** \n > **Ex: ${config.prefix}search pl 1** \n > \n ${resultChoices}`)
            .then(newMessage => addSearchReactions(newMessage));
    }
};

const makeSearchVideoOrPlaylistString = (message: Message, type: string): string => {
    let resultChoices = '';
    if (type === 'video') {
        resultChoices += '> **Musiques** \n';
        (searchVideo[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + '\n';
        });
    }
    else {
        resultChoices += '> **Playlists** \n';
        (searchPlaylist[Number(message.guild?.id)]['array'] as searchVideoArrayType[]).map((song, index) => {
            resultChoices += '> **' + (index + 1) + '**. ' + song.title + ' (' + song.plLength + ')\n';
        });
    }
    return resultChoices;
};

const playSong = (message: Message): void => {
    const setting = Settings.get(String(message.guild?.id));
    const embedObj = setEmbedObj(playlistInfos[Number(message.guild?.id)][0].title, playlistInfos[Number(message.guild?.id)][0].id, playlistInfos[Number(message.guild?.id)][0].thumbnail, playlistInfos[Number(message.guild?.id)][0].duration);
    sendMusicEmbed(message, embedObj);
    const stream = ytdl(playlistArray[Number(message.guild?.id)]['url'][0], { filter: 'audio', liveBuffer: 10000, highWaterMark: 512 });
    delete musicParams.tryToNext[Number(message.guild?.id)];
    streamsArray[Number(message.guild?.id)] = connectionsArray[Number(message.guild?.id)].play(stream, { highWaterMark: 512 });
    // CHECK IF SPEAKING --> !streamsArray[Number(message.guild?.id)].player.voiceConnection.speaking.bitfield
    streamsArray[Number(message.guild?.id)].setVolume(setting ? setting.audio.volume : 0.4);
    // Save time at start to verify finish event isn't call too early
    // musicTimes[Number(message.guild?.id)] = Date.now()
    streamsArray[Number(message.guild?.id)].on('error', (e: Error) => {
        handleError(message, e);
    });
    streamsArray[Number(message.guild?.id)].on('finish', () => {
        handleFinish(message);
    });
};

const handleFinish = (message: Message): void => {
    // const diffSec = Math.floor((Date.now() - musicTimes[Number(message.guild?.id)]) / 1000)
    // if (diffSec < this.getSeconds(playlistInfos[Number(message.guild?.id)][0].duration)) {
    //     // If stream is stop too early recall stream at the end of the current
    //     console.log('Try to resume song')
    //     const missingTime = this.getSeconds(playlistInfos[Number(message.guild?.id)][0].duration) - diffSec
    //     console.log('missing times : ', missingTime)
    //     console.log('music duration : ', this.getSeconds(playlistInfos[Number(message.guild?.id)][0].duration))
    //     const beginAt = this.convertSecondsToFormattedDuration(this.getSeconds(playlistInfos[Number(message.guild?.id)][0].duration) - missingTime)
    //     this.playSong(message, beginAt)
    // }
    // else {
    //     setTimeout(() => {
    //         this.setArrays(message)
    //     }, 1000)
    // }
    setTimeout(() => {
        setArrays(message);
    }, 1000);
};

const handleError = (message: Message, e: Error): void => {
    console.log('--------------------------------------');
    console.log('Titre : ', playlistInfos[Number(message.guild?.id)][0].title);
    console.log('e message : ', e.message);
    if (e.message.indexOf('This video contains content') !== -1) {
        message.channel.send('❌ Vidéo bloquée par droit d\'auteur : `' + playlistInfos[Number(message.guild?.id)][0].title + '`');
    }
    else if (e.message.indexOf('this video available in your country') !== -1) {
        message.channel.send('❌ Vidéo non disponible dans ce pays : `' + playlistInfos[Number(message.guild?.id)][0].title + '`');
    }
    next(message);
    console.log('--------------------------------------');
};

const setArrays = (message: Message): void => {
    // If still connected but the end callback is call to early (after few seconds of playing)
    if (playlistArray[Number(message.guild?.id)]) {
        // If loop is desactivate
        if (!musicParams.loop[Number(message.guild?.id)]) {
            delete playlistArray[Number(message.guild?.id)]['url'][0];
            delete playlistInfos[Number(message.guild?.id)][0];
            playlistArray[Number(message.guild?.id)]['url'] = _.compact(playlistArray[Number(message.guild?.id)]['url']);
            playlistInfos[Number(message.guild?.id)] = _.compact(playlistInfos[Number(message.guild?.id)]);
        }
        // If playlist is empty
        if (!playlistArray[Number(message.guild?.id)]['url'][0]) {
            musicParams.wait[Number(message.guild?.id)] = true;
            // Use this condition if loop is activate and user try to go to the next song without queued songs
            if (musicParams.loop[Number(message.guild?.id)] || musicParams.nextSetLoop[Number(message.guild?.id)]) {
                delete musicParams.loop[Number(message.guild?.id)];
                delete musicParams.nextSetLoop[Number(message.guild?.id)];
                message.channel.send('▶️ Mode répétition désactivé');
            }
            message.channel.send('🎵 Plus de musique en file d\'attente');
        }
        else {
            // If loop is activate and command 'next' is called
            if (musicParams.nextSetLoop[Number(message.guild?.id)]) {
                musicParams.loop[Number(message.guild?.id)] = true;
                delete musicParams.nextSetLoop[Number(message.guild?.id)];
            }
            playSong(message);
        }
    }
};

const sendMusicEmbed = (message: Message, embedObj: embedObjType, added: [boolean, number] = [false, 1], type: string = 'video', force: boolean = false): void => {
    const setting = Settings.get(String(message.guild?.id));
    const add = added[0] && setting && setting.notif.added === 'on';
    const current = !added[0] && setting && setting.notif.current === 'on';
    if (!setting || force || add || current) {
        const queuedLength = playlistArray[Number(message.guild?.id)]['url'].length - 1;
        let formattedDuration = '';
        const musicLink = type === 'video' ? `[${embedObj.title}](https://www.youtube.com/watch?v=${embedObj.id})` : `[${embedObj.title}](https://www.youtube.com/playlist?list=${embedObj.id})`;
        const color = added[0] ? 3768896 : 5520025;
        const title = added[0] && added[1] > 1 ? 'Playlist ajoutée' : added[0] ? 'Musique ajoutée' : 'Musique';
        const authorUrl = title.indexOf('ajoutée') !== -1 ? 'https://syxbot.com/assets/img/music_add.png' : 'https://syxbot.com/assets/img/embed_music.png';
        // Calculate the queued duration and save as formatted string
        if (playlistArray[Number(message.guild?.id)]['url'].length >= 2) {
            playlistInfos[Number(message.guild?.id)].map((video, index) => {
                if (index >= 1) {
                    addDuration(message, index, video.duration, 'current');
                }
            });
            formattedDuration = convertSecondsToFormattedDuration(Number(playlistArray[Number(message.guild?.id)]['currentDuration']));
        }
        // Blank field used to align items
        const embed = new Discord.MessageEmbed()
            .setAuthor(title, authorUrl)
            .setColor(color)
            .setFooter('🎶 "' + config.prefix + 'p list" pour afficher la file d\'attente')
            .setThumbnail(embedObj.thumbnail)
            .addField('Titre', musicLink, true)
            .addField('\u200b', '\u200b', true)
            .addField('File d\'attente', queuedLength, true)
            .addField('Durée', embedObj.duration, true)
            .addField('\u200b', '\u200b', true)
            .addField('Durée en attente', formattedDuration || '0', true);
        message.channel.send({ embed });
    }
};

const getPlaylist = (message: Message, words: string[], playSongParams: boolean, byReaction: [boolean, User | PartialUser]): void => {
    message.channel.send('🛠 Ajout de la playlist en cours ...');
    // Call playlist API
    ytpl(words[1], { limit: 0 }, (err, playlist: ytpl.result) => {
        if (playlist) {
            return addPlaylistItems(message, playlist, playSongParams, byReaction);
        }
        return message.channel.send('❌ Impossible de charger la playlist, probablement indisponible dans ce pays !');
    });
};

const addPlaylistItems = (message: Message, playlist: ytpl.result, play: boolean, byReaction: [boolean, User | PartialUser]): void => {
    let voiceChannel: VoiceChannel = Helper.take_user_voiceChannel(message);
    if (byReaction[0]) {
        voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1]);
    }
    if (radioPlayed[Number(message.guild?.id)] || play) {
        // If radio is active or if we tell us to play the song now
        playlistArray[Number(message.guild?.id)]['url'] = [];
        playlistInfos[Number(message.guild?.id)] = [];
        delete radioPlayed[Number(message.guild?.id)];
    }
    // Push items in playlist array and tell us how many was removed
    const playlistLength = pushPlaylistItems(message, playlist);
    // Get new playlist formatted duration
    const formattedDuration = convertSecondsToFormattedDuration(Number(playlistArray[Number(message.guild?.id)]['newPlaylistDuration']));
    const embedObj = setEmbedObj(playlist.title, playlist.id, playlist.items[0].thumbnail, formattedDuration);
    if (play) {
        voiceChannel.join()
            .then(connection => {
                connectedGuild[Number(message.guild?.id)] = voiceChannel.id;
                connectionsArray[Number(message.guild?.id)] = connection;
                sendMusicEmbed(message, embedObj, [true, playlist.items.length], 'playlist');
                playSong(message);
            });
    }
    else {
        // Send the added embed
        sendMusicEmbed(message, embedObj, [true, playlist.items.length], 'playlist');
        if (radioPlayed[Number(message.guild?.id)]) {
            streamsArray[Number(message.guild?.id)].destroy();
            delete radioPlayed[Number(message.guild?.id)];
            playSong(message);
        }
        else if (musicParams.wait[Number(message.guild?.id)] || playlistArray[Number(message.guild?.id)]['url'].length === playlistLength) {
            delete musicParams.wait[Number(message.guild?.id)];
            playSong(message);
        }
    }
};

const pushPlaylistItems = (message: Message, playlist: ytpl.result): number => {
    const videoURL = 'https://www.youtube.com/watch?v=';
    let pushCount = 0;
    (playlist.items as any).map((video: any) => {
        if (video.videoDetails.title !== '[Deleted video]' && video.videoDetails.title !== '[Private video]') {
            // Push elements and calculate how many elements was pushed
            pushCount++;
            addDuration(message, pushCount, video.videoDetails.duration, 'new');
            playlistArray[Number(message.guild?.id)]['url'].push(videoURL + video.videoDetails.videoId);
            let thumbnailURL = '';
            if (video.videoDetails.thumbnail) {
                thumbnailURL = video.videoDetails.thumbnail;
            }
            playlistInfos[Number(message.guild?.id)].push({
                title: video.videoDetails.title,
                id: video.videoDetails.id,
                thumbnail: thumbnailURL,
                duration: video.videoDetails.duration
            });
        }
    });
    const deletedVideo = playlist.total_items - pushCount;
    if (deletedVideo >= 1) {
        message.channel.send('🗑 ' + deletedVideo + (deletedVideo === 1 ? ' vidéo supprimée' : ' vidéos supprimées'));
    }
    return pushCount;
};

const convertSecondsToFormattedDuration = (duration: number): string => {
    // Format duration as '5:08' | '1:05:08'
    const videoDate = new Date(duration * 1000);
    const hours = videoDate.getUTCHours();
    const minutes = videoDate.getUTCMinutes();
    const seconds = videoDate.getUTCSeconds();
    let formatedDuration = '';
    formatedDuration += hours > 0 ? hours.toString() + ':' : '';
    formatedDuration += minutes > 9 ? minutes.toString() + ':' : hours > 0 ? '0' + minutes.toString() + ':' : minutes.toString() + ':';
    formatedDuration += seconds > 9 ? seconds.toString() : '0' + seconds.toString();
    return formatedDuration;
};

const addDuration = (message: Message, count: number, duration: string, type = 'new'): number => {
    // Increment seconds value
    if (count === 1) {
        if (type === 'new') {
            return playlistArray[Number(message.guild?.id)]['newPlaylistDuration'] = getSeconds(duration);
        }
        return playlistArray[Number(message.guild?.id)]['currentDuration'] = getSeconds(duration);
    }
    if (type === 'new') {
        return playlistArray[Number(message.guild?.id)]['newPlaylistDuration']! += getSeconds(duration);
    }
    return playlistArray[Number(message.guild?.id)]['currentDuration']! += getSeconds(duration);
};

const getSeconds = (duration: string): number => {
    // Convert and return a formatted time in seconds
    const splittedDuration = duration.split(':');
    let resultSeconds = 0;
    if (splittedDuration.length === 3) {
        resultSeconds += Number(splittedDuration[0]) * 3600;
        resultSeconds += Number(splittedDuration[1]) * 60;
        resultSeconds += Number(splittedDuration[2]);
    }
    else {
        resultSeconds += Number(splittedDuration[0]) * 60;
        resultSeconds += Number(splittedDuration[1]);
    }
    return resultSeconds;
};

export const getVideo = async (message: Message, words: string[], playSongParams: boolean = true, byReaction: [boolean, User | PartialUser]): Promise<Message | void> => {
    // Call video API
    const infos = await ytdl.getBasicInfo(words[1]);
    if (infos) {
        if (infos.videoDetails.title !== '[Deleted video]' && infos.videoDetails.title !== '[Private video]') {
            return setMusicArrayAndPlayMusic(infos, message, playSongParams, byReaction);
        }
        return message.channel.send('❌ Cette vidéo est privée ou a été supprimée !');
    }
    return message.channel.send('❌ Impossible de charger la vidéo !');
};

const setMusicArrayAndPlayMusic = (infos: ytdl.videoInfo, message: Message, playSongParams: boolean, byReaction: [boolean, User | PartialUser]): void => {
    if (playSongParams || musicParams.wait[Number(message.guild?.id)]) {
        // If must play or bot waiting so join channel
        delete musicParams.wait[Number(message.guild?.id)];
        let voiceChannel = Helper.take_user_voiceChannel(message);
        if (byReaction[0]) {
            voiceChannel = Helper.take_user_voiceChannel_by_reaction(message, byReaction[1]);
        }
        voiceChannel.join()
            .then(connection => {
                clearAndAddArrayInfos(message, infos);
                connectedGuild[Number(message.guild?.id)] = voiceChannel.id;
                connectionsArray[Number(message.guild?.id)] = connection;
                playSong(message);
            });
    }
    else if (radioPlayed[Number(message.guild?.id)]) {
        // if radio is active remove it and play song
        delete radioPlayed[Number(message.guild?.id)];
        clearAndAddArrayInfos(message, infos);
        playSong(message);
    }
    else {
        // If radio is inactive and song is playing so send the added embed
        const formattedDuration = clearAndAddArrayInfos(message, infos);
        const embedObj = setEmbedObj(infos.videoDetails.title, infos.videoDetails.videoId, infos.videoDetails.thumbnail.thumbnails[0].url, formattedDuration);
        if (playlistArray[Number(message.guild?.id)]['url'].length === 1) {
            return playSong(message);
        }
        return sendMusicEmbed(message, embedObj, [true, 1]);
    }
};

const setEmbedObj = (title: string, id: string, thumbnail: string, duration: string): embedObjType => {
    return {
        title: title,
        id: id,
        thumbnail: thumbnail,
        duration: duration
    };
};

const clearAndAddArrayInfos = (message: Message, infos: ytdl.videoInfo): string => {
    // Create queued array if needed and push item in it
    if (!playlistArray[Number(message.guild?.id)] || !playlistArray[Number(message.guild?.id)]['url']) {
        playlistArray[Number(message.guild?.id)] = { url: [] };
        playlistInfos[Number(message.guild?.id)] = [];
    }
    playlistArray[Number(message.guild?.id)]['url'].push(infos.videoDetails.video_url);
    const formattedDuration = convertSecondsToFormattedDuration(Number(infos.videoDetails.lengthSeconds));
    playlistInfos[Number(message.guild?.id)].push({
        title: infos.videoDetails.title,
        id: infos.videoDetails.videoId,
        thumbnail: infos.videoDetails.thumbnail.thumbnails[0].url,
        duration: formattedDuration
    });
    return formattedDuration;
};

const getSongInPlaylist = (message: Message, number: number): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if (playlistInfos[Number(message.guild?.id)] && playlistInfos[Number(message.guild?.id)].length) {
            if (number > 0 && number <= playlistInfos[Number(message.guild?.id)].length) {
                // Add the current music at the top of the list
                playlistInfos[Number(message.guild?.id)].splice(1, 0, playlistInfos[Number(message.guild?.id)][0]);
                playlistArray[Number(message.guild?.id)]['url'].splice(1, 0, playlistArray[Number(message.guild?.id)]['url'][0]);
                // Add selected music at the top of the list
                playlistInfos[Number(message.guild?.id)].splice(1, 0, playlistInfos[Number(message.guild?.id)][number + 1]);
                playlistArray[Number(message.guild?.id)]['url'].splice(1, 0, playlistArray[Number(message.guild?.id)]['url'][number + 1]);
                // Remove selected music from where we copy it (+2 because we add 2 item before)
                delete playlistInfos[Number(message.guild?.id)][number + 2];
                delete playlistArray[Number(message.guild?.id)]['url'][number + 2];
                // Remove current music
                delete playlistInfos[Number(message.guild?.id)][0];
                delete playlistArray[Number(message.guild?.id)]['url'][0];
                // Compact who remove all falsey values
                playlistArray[Number(message.guild?.id)]['url'] = _.compact(playlistArray[Number(message.guild?.id)]['url']);
                playlistInfos[Number(message.guild?.id)] = _.compact(playlistInfos[Number(message.guild?.id)]);
                // Destroy stream and start playing
                streamsArray[Number(message.guild?.id)].destroy();
                return playSong(message);
            }
            else {
                let howToSay = 'chiffre';
                if (playlistInfos[Number(message.guild?.id)].length >= 10) {
                    howToSay = 'nombre';
                }
                return message.channel.send(`❌ Choisissez un ${howToSay} compris entre 1 et ${playlistInfos[Number(message.guild?.id)].length - 1}`);
            }
        }
        return message.channel.send('❌ Aucune musique dans la file d\'attente');
    }
};

const showQueuedSongs = (message: Message): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if (playlistInfos[Number(message.guild?.id)] && playlistInfos[Number(message.guild?.id)].length >= 2) {
            // Create songs array and send multiple message if needed (max message length to 2000)
            createSongsString(message).map((list, index) => {
                if (index === 0) {
                    if (playlistInfos[Number(message.guild?.id)].length >= 3) {
                        return message.channel.send(`> **Musiques en file d'attente** \n > \n${list}`);
                    }
                    return message.channel.send(`> **La musique en file d'attente** \n > \n${list}`);
                }
                return message.channel.send(`${list}`);
            });
        }
        return message.channel.send('❌ Aucune musique dans la file d\'attente');
    }
};

const createSongsString = (message: Message): string[] => {
    const songsArray: string[] = [];
    let songs = '';
    // Create string with queued songs
    playlistInfos[Number(message.guild?.id)].map((music, index) => {
        if (index !== 0) {
            const newSong = '> **' + index + '**. ' + music.title + '\n';
            if (songs.length + newSong.length >= 1950) {
                songsArray.push(songs);
                songs = newSong;
            }
            else {
                songs += newSong;
            }
        }
    });
    if (songs.length) {
        songsArray.push(songs);
    }
    return songsArray;
};

const removeSelectedSongsMaster = (message: Message, words: string[]): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (userChannel) {
        if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
            if (playlistArray[Number(message.guild?.id)] && playlistArray[Number(message.guild?.id)]['url'].length) {
                if (words[2]) {
                    const selection = words[2].split('-');
                    if (selection.length <= 2) {
                        // If there is a playlist and user are in the same channel as the bot
                        return removeSelectedSongs(message, selection);
                    }
                    return message.channel.send('❌ Écrivez 2 index maximum.```Ex: ' + config.prefix + 'p remove 15-20```');
                }
                return message.channel.send('❌ Vous devez sélectionner la/les musique(s) à supprimé');
            }
            return message.channel.send('❌ Aucune musique dans la file d\'attente');
        }
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

const removeSelectedSongs = (message: Message, selection: string[]): void | Promise<Message> => {
    const selectZero = Number(selection[0]);
    if (selection[1]) {
        const selectOne = Number(selection[1]);
        if (selectOne && selectZero && selectZero < selectOne) {
            if (selectZero > 0 && selectOne < playlistArray[Number(message.guild?.id)]['url'].length) {
                // If 2 index is number and beetwen 1 and the queued length
                for (let i = selectZero; i <= selectOne; i++) {
                    delete playlistInfos[Number(message.guild?.id)][i];
                    delete playlistArray[Number(message.guild?.id)]['url'][i];
                }
                playlistArray[Number(message.guild?.id)]['url'] = _.compact(playlistArray[Number(message.guild?.id)]['url']);
                playlistInfos[Number(message.guild?.id)] = _.compact(playlistInfos[Number(message.guild?.id)]);
                return sendRemoveEmbed(message, (selectOne - selectZero) + 1);
            }
            return message.channel.send('❌ Sélectionnez des musiques compris entre 1 et ' + (playlistArray[Number(message.guild?.id)]['url'].length - 1));
        }
        return message.channel.send('❌ Le 2ème index doit être plus grand que le premier !');
    }
    else if (selectZero && selectZero > 0 && selectZero < playlistArray[Number(message.guild?.id)]['url'].length) {
        // If 1 index is number and beetwen 1 and the queued length
        delete playlistInfos[Number(message.guild?.id)][selectZero];
        delete playlistArray[Number(message.guild?.id)]['url'][selectZero];
        playlistArray[Number(message.guild?.id)]['url'] = _.compact(playlistArray[Number(message.guild?.id)]['url']);
        playlistInfos[Number(message.guild?.id)] = _.compact(playlistInfos[Number(message.guild?.id)]);
        return sendRemoveEmbed(message, 1);
    }
    return message.channel.send('❌ Sélectionnez une musique compris entre 1 et ' + (playlistArray[Number(message.guild?.id)]['url'].length - 1));
};

export const go = (message: Message, words: string[]): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (userChannel) {
        if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
            if (words[1] && Number(words[1])) {
                const number = Number(words[1]);
                if (playlistArray[Number(message.guild?.id)] && playlistArray[Number(message.guild?.id)]['url'].length > 1) {
                    if (number > 0 && number < playlistArray[Number(message.guild?.id)]['url'].length) {
                        // If playlist exist and number is between 1 and queued length && verif user channel and bot location
                        streamsArray[Number(message.guild?.id)].destroy();
                        for (let i = 0; i < number; i++) {
                            delete playlistInfos[Number(message.guild?.id)][i];
                            delete playlistArray[Number(message.guild?.id)]['url'][i];
                        }
                        playlistArray[Number(message.guild?.id)]['url'] = _.compact(playlistArray[Number(message.guild?.id)]['url']);
                        playlistInfos[Number(message.guild?.id)] = _.compact(playlistInfos[Number(message.guild?.id)]);
                        sendRemoveEmbed(message, number);
                        return playSong(message);
                    }
                    return message.channel.send('❌ Sélectionnez une musique compris entre 1 et ' + (playlistArray[Number(message.guild?.id)]['url'].length - 1));
                }
                return message.channel.send('❌ Aucune musique dans la file d\'attente');
            }
            return message.channel.send('❌ Sélectionnez l\'index d\'une musique.```Ex: ' + config.prefix + 'go 12```');
        }
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

export const current = (message: Message): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (userChannel) {
        if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
            if (playlistArray[Number(message.guild?.id)] && playlistArray[Number(message.guild?.id)]['url'].length) {
                const embedObj = setEmbedObj(playlistInfos[Number(message.guild?.id)][0].title, playlistInfos[Number(message.guild?.id)][0].id, playlistInfos[Number(message.guild?.id)][0].thumbnail, playlistInfos[Number(message.guild?.id)][0].duration);
                return sendMusicEmbed(message, embedObj, [false, 1], 'video', true);
            }
            return message.channel.send('❌ Aucune musique dans la file d\'attente');
        }
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

const sendRemoveEmbed = (message: Message, number: number): void => {
    const setting = Settings.get(String(message.guild?.id));
    if (!setting || (setting && setting.notif.removed === 'on')) {
        const title = number > 1 ? 'Musiques supprimées' : 'Musique supprimée';
        const queuedLength = playlistArray[Number(message.guild?.id)]['url'].length - 1;
        // #952716 | Rouge | Decimal value
        const color = 9774870;
        const embed = new Discord.MessageEmbed()
            .setAuthor(title, 'https://syxbot.com/assets/img/removed_music.png')
            .setColor(color)
            .setFooter('🎶 "' + config.prefix + 'p list" pour afficher la file d\'attente')
            .addField('Nombre', number, true)
            .addField('\u200b', '\u200b', true)
            .addField('File d\'attente', queuedLength, true);
        message.channel.send({ embed });
    }
};

export const joinChannel = (message: Message): void | Promise<Message> => {
    const voiceChannel = Helper.take_user_voiceChannel(message);
    if (voiceChannel) {
        if (!playlistArray[Number(message.guild?.id)] && !playlistArray[Number(message.guild?.id)]['url'] && !radioPlayed[Number(message.guild?.id)]) {
            voiceChannel.join()
                .then(connection => {
                    connectedGuild[Number(message.guild?.id)] = voiceChannel.id;
                    connectionsArray[Number(message.guild?.id)] = connection;
                    return;
                });
        }
        return message.channel.send('❌ Impossible de se connecter, le bot n\'est pas disponible !');
    }
    return message.channel.send('❌ Vous devez être connecté dans un salon !');
};

export const stop = (message: Message, leave: boolean = true): void => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if (streamsArray[Number(message.guild?.id)]) {
            streamsArray[Number(message.guild?.id)].destroy();
        }
        if (leave) {
            connectionsArray[Number(message.guild?.id)].channel.leave();
            delete connectedGuild[Number(message.guild?.id)];
            delete connectionsArray[Number(message.guild?.id)];
            delete musicParams.wait[Number(message.guild?.id)];
        }
        else {
            musicParams.wait[Number(message.guild?.id)] = true;
        }
        if (leave || playlistArray[Number(message.guild?.id)] && playlistArray[Number(message.guild?.id)]['url'].length) {
            delete streamsArray[Number(message.guild?.id)];
            delete playlistArray[Number(message.guild?.id)];
            delete playlistInfos[Number(message.guild?.id)];
            delete radioPlayed[Number(message.guild?.id)];
            delete musicParams.loop[Number(message.guild?.id)];
            delete musicParams.tryToNext[Number(message.guild?.id)];
        }
        else if ((!playlistArray[Number(message.guild?.id)] && !radioPlayed[Number(message.guild?.id)]) ||
            (playlistArray[Number(message.guild?.id)] && !playlistArray[Number(message.guild?.id)]['url'].length)
        ) {
            message.channel.send('❌ Aucune musique en file d\'attente');
        }
    }
};

export const pause = (message: Message): void => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if ((!playlistArray[Number(message.guild?.id)] && !radioPlayed[Number(message.guild?.id)]) ||
            (playlistArray[Number(message.guild?.id)] && !playlistArray[Number(message.guild?.id)]['url'].length)
        ) {
            message.channel.send('❌ Aucune musique en cours d\'écoute');
        }
        else if (streamsArray[Number(message.guild?.id)]) {
            streamsArray[Number(message.guild?.id)].pause(true);
        }
    }
};

export const resume = (message: Message): void => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if ((!playlistArray[Number(message.guild?.id)] && !radioPlayed[Number(message.guild?.id)]) ||
            (playlistArray[Number(message.guild?.id)] && !playlistArray[Number(message.guild?.id)]['url'].length)
        ) {
            message.channel.send('❌ Aucune musique en cours d\'écoute');
        }
        else if (streamsArray[Number(message.guild?.id)]) {
            streamsArray[Number(message.guild?.id)].resume();
        }
    }
};

export const next = (message: Message): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel(message);
    if (Helper.verifyBotLocation(message, connectedGuild[Number(message.guild?.id)], userChannel)) {
        if (playlistArray[Number(message.guild?.id)] && playlistArray[Number(message.guild?.id)]['url'].length) {
            musicParams.tryToNext[Number(message.guild?.id)] = true;
            if (musicParams.loop[Number(message.guild?.id)]) {
                delete musicParams.loop[Number(message.guild?.id)];
                musicParams.nextSetLoop[Number(message.guild?.id)] = true;
            }
            streamsArray[Number(message.guild?.id)].destroy();
            return setArrays(message);
        }
        return message.channel.send('❌ Aucune musique en file d\'attente');
    }
};
