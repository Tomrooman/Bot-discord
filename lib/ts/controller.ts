'use strict';

import * as Player from './player';
import * as Radio from './radio';
import * as Helper from './helper';
import * as Custom from './custom';
import * as Admin from './admin';
import * as Settings from './settings';
import * as Dragodinde from './dragodinde';
import * as MessageFunc from './message';
import { Message, Client } from 'discord.js';

export const Controller = (message: Message, prefix: string, bot: Client): void | Promise<void | Message> => {
    // Prevent bad prefix
    if (message.content.substr(0, prefix.length) === prefix && message.content.substr(0, 3) !== '!!!') {
        const words = message.content.substr(prefix.length, message.content.length - prefix.length).split(' ');
        const command = words[0].toLowerCase();
        if (message.content.length > prefix.length) {
            if (command === 'play' || command === 'playlist' || command === 'p' || command === 'pl')
                return Player.instantiate(message, command, words);
            if (command === 'next') return Player.next(message);
            if (command === 'search') {
                if (words[1]) return Player.selectSongOrPlaylistInSearchList(message, words);
                return Player.getSongInSearchList(message);
            }
            if (command === 'go') return Player.go(message, words);
            if (command === 'set' || command === 'settings') return Settings.instantiate(message, words);
            if (command === 'd' || command === 'dd' || command === 'drago' ||
                command === 'dragodinde' || command === 'dragodindes')
                return Dragodinde.controller(message, words);
            if (command === 'current' || command === 'now') return Player.current(message);
            if (command === 'join') return Player.joinChannel(message);
            if (command === 'repeat') return Player.toggleLoop(message);
            if (command === 'cancel') return Player.cancel(message);
            if (command === 'quit') return Player.stop(message);
            if (command === 'stop') return Player.stop(message, false);
            if (command === 'pause') return Player.pause(message);
            if (command === 'resume') return Player.resume(message);
            if (command === 'radio') return Radio.instantiate(message, words);
            if (command === 'remove') return MessageFunc.instantiate(message, words);
            if (command === 'clear') return MessageFunc.instantiate(message, words, 'all');
            if (command === 'help') return Helper.instantiate(message, words);
            if (command === 'pioupiou') return Custom.pioupiou(message);
            if (command === 'admin') return Admin.instantiate(message, words, bot);
            return message.channel.send('❌ La commande `' + command + '` n\'existe pas ! \n \
            ❔ Tapez `' + prefix + 'help` pour afficher la liste des commandes.');
        }
        return message.channel.send('❌ Vous n\'avez pas écrit de commande !');
    }
};
