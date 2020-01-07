import Helper from './helper.js';

export default class Admin {
    constructor(message, words, bot) {
        this.controller(message, words, bot);
    }

    controller(message, words, bot) {
        if (message.author.username + message.author.discriminator === 'Stalyr9246') {
            if (words[1]) {
                if (words[1] === 'message') {
                    this.sendMessageToAllServer(message, words, bot);
                }
                else if (words[1] === 'count') {
                    message.channel.send('> Connected guilds : **' + bot.guilds.size + '**');
                }
                else {
                    message.channel.send('> Cette commande admin n\'existe pas');
                }
            }
            else {
                message.channel.send('> Ecrit la commande admin a éxécutée, pour l\'instant juste : message');
            }
        }
        else {
            message.channel.send('> Vous ne faites pas partit des admins');
        }
    }

    sendMessageToAllServer(message, words, bot) {
        if (words[2]) {
            delete words[0];
            delete words[1];
            // send message to all first available guild's channel
            bot.guilds.map(guild => {
                if (guild.available) {
                    const channel = Helper.getFirstAuthorizedChannel(guild);
                    channel.send('> ' + words.join(' ').trim());
                }
            });
        }
        else {
            message.channel.send('> Tu n\'as pas écrit de message !');
        }
    }

}
