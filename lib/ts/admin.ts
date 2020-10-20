'use strict';

import * as Helper from './helper';
import { Message, Client } from 'discord.js';

export const instantiate = (message: Message, words: string[], bot: Client): void | Promise<Message> => {
    if (message.author.username + message.author.discriminator === 'Stalyr9246') {
        if (words[1]) {
            if (words[1] === 'message') return sendMessageToAllServer(message, words, bot);
            if (words[1] === 'count')
                return message.channel.send('> Connected guilds : **' + bot.guilds.cache.size + '**');
            if (words[1] === 'status') {
                // Working get status 0
                return message.channel.send('> Status : **' + bot.ws.status + '**');
            }
            if (words[1] === 'ping') return message.channel.send('> Ping : **' + bot.ws.ping + '**');
            return message.channel.send('❌ Cette commande admin n\'existe pas');
        }
        return message.channel.send('❌ Ecrit la commande admin a éxécutée: message|count|status|ping');
    }
    return message.channel.send('❌ Vous ne faites pas partit des admins');
};

const sendMessageToAllServer = (message: Message, words: string[], bot: Client): void | Promise<Message> => {
    if (!words[2]) return message.channel.send('❌ Tu n\'as pas écrit de message !');
    delete words[0];
    delete words[1];
    // send message to all first available guild's channel
    bot.guilds.cache.map(guild => {
        if (guild.available) {
            const channel = Helper.getFirstAuthorizedChannel(guild);
            if (channel) channel.send('> ' + words.join(' ').trim());
        }
    });
};
