'use strict';

import Helper from './helper';
import { Message, Client } from 'discord.js';

export default class Admin {
    constructor(message: Message, words: string[], bot: Client) {
        this.controller(message, words, bot);
    }

    controller(message: Message, words: string[], bot: Client): void {
        if (message.author.username + message.author.discriminator === 'Stalyr9246') {
            if (words[1]) {
                if (words[1] === 'message') {
                    this.sendMessageToAllServer(message, words, bot);
                }
                else if (words[1] === 'count') {
                    message.channel.send('> Connected guilds : **' + bot.guilds.cache.size + '**');
                }
                else if (words[1] === 'status') {
                    // Working get status 0
                    message.channel.send('> Status : **' + bot.ws.status + '**');
                }
                else if (words[1] === 'ping') {
                    message.channel.send('> Ping : **' + bot.ws.ping + '**');
                }
                else {
                    message.channel.send('❌ Cette commande admin n\'existe pas');
                }
            }
            else {
                message.channel.send('❌ Ecrit la commande admin a éxécutée, pour l\'instant juste : message');
            }
        }
        else {
            message.channel.send('❌ Vous ne faites pas partit des admins');
        }
    }

    sendMessageToAllServer(message: Message, words: string[], bot: Client): void {
        if (words[2]) {
            delete words[0];
            delete words[1];
            // send message to all first available guild's channel
            bot.guilds.cache.map(guild => {
                if (guild.available) {
                    const channel = Helper.getFirstAuthorizedChannel(guild);
                    if (channel) {
                        channel.send('> ' + words.join(' ').trim());
                    }
                }
            });
        }
        else {
            message.channel.send('❌ Tu n\'as pas écrit de message !');
        }
    }

}
