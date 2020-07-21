'use strict';

import Player from './player.js';
import Radio from './radio.js';
import Message from './message.js';
import Level from './level.js';
import Helper from './helper.js';
import Custom from './custom.js';
import Admin from './admin.js';
import Settings from './settings.js';

export default function controller(message, prefix, bot) {
    // Prevent bad prefix
    if (message.content.substr(0, prefix.length) === prefix && message.content.substr(0, 3) !== '!!!') {
        const words = message.content.substr(prefix.length, message.content.length - prefix.length).split(' ');
        const command = words[0].toLowerCase();
        if (message.content.length > prefix.length) {
            if (command === 'play' || command === 'playlist' || command === 'p' || command === 'pl' ||
                command === 'search' || command === 'go' || command === 'next') {
                new Player(message, command, words);
            }
            else if (command === 'set' || command === 'settings') {
                new Settings(message, words);
            }
            else if (command === 'current' || command === 'now') {
                new Player().current(message);
            }
            else if (command === 'join') {
                Player.joinChannel(message);
            }
            else if (command === 'repeat') {
                Player.toggleLoop(message);
            }
            else if (command === 'cancel') {
                Player.cancel(message);
            }
            else if (command === 'quit') {
                Player.stop(message);
            }
            else if (command === 'stop') {
                Player.stop(message, false);
            }
            else if (command === 'pause') {
                Player.pause(message);
            }
            else if (command === 'resume') {
                Player.resume(message);
            }
            else if (command === 'radio') {
                new Radio(message, words);
            }
            else if (command === 'remove') {
                new Message(message, words);
            }
            else if (command === 'clear') {
                new Message(message, words, 'all');
            }
            else if (command === 'grade') {
                Level.grade(message);
            }
            else if (command === 'help') {
                new Helper(message, words);
            }
            else if (command === 'pioupiou') {
                Custom.pioupiou(message);
            }
            else if (command === 'admin') {
                new Admin(message, words, bot);
            }
            else {
                message.channel.send('❌ La commande `' + command + '` n\'existe pas ! \n❔ Tapez `' + prefix + 'help` pour afficher la liste des commandes.');
            }
        }
        else {
            message.channel.send('❌ Vous n\'avez pas écrit de commande !');
        }
    }
}
