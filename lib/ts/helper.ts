'use strict';

import commands from '../json/commands.json';
import { VoiceChannel } from 'discord.js';

export default class Helper {
    constructor(message, words) {
        if (words[1]) {
            this.getCommandInfos(message, words[1].toLowerCase());
        }
        else {
            this.showCommandlist(message);
        }
    }

    static take_user_voiceChannel(message): VoiceChannel {
        let voiceChannel = {};
        if (message.guild) {
            message.guild.channels.cache.map(channel => {
                if (channel.type === 'voice') {
                    if (channel.members) {
                        channel.members.map(member => {
                            if (member.user.id === message.author.id) {
                                voiceChannel = channel;
                            }
                        });
                    }
                }
            });
        }
        return voiceChannel as VoiceChannel;
    }

    static take_user_voiceChannel_by_reaction(message, author): VoiceChannel {
        let voiceChannel = {};
        message.guild.channels.cache.map(channel => {
            if (channel.type === 'voice') {
                if (channel.members) {
                    channel.members.map(member => {
                        if (member.user.id === author.id) {
                            voiceChannel = channel;
                        }
                    });
                }
            }
        });
        return voiceChannel as VoiceChannel;
    }

    // static getBot(message, choice) {
    //     let botMember = false;
    //     message.guild.channels.map(channel => {
    //         if (channel.type === 'voice') {
    //             if (channel.members) {
    //                 channel.members.map(member => {
    //                     if (member.user.bot && member.user.id === config.clientId) {
    //                         if (choice === 'bot') {
    //                             botMember = member;
    //                         }
    //                         else if (choice === 'channel') {
    //                             botMember = channel;
    //                         }
    //                     }
    //                 });
    //             }
    //         }
    //     });
    //     return botMember;
    // }

    static getFirstAuthorizedChannel(guild) {
        if (guild.channels.cache.has(guild.id)) return guild.channels.cache.get(guild.id);

        // Check for a "general" channel
        const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
        if (generalChannel) return generalChannel;

        // If there is no "general" channel, get the first authorized text channel
        // "guild.client.user" is the bot object
        return guild.channels.cache
            .filter(c => c.type === 'text' &&
                c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
            .first();
    }

    static verifyBotLocation(message, connectedGuild, userChannel, sendMessage = true) {
        if (connectedGuild) {
            if (connectedGuild === userChannel.id) {
                return true;
            }
            else {
                if (sendMessage) {
                    message.channel.send('❌ Vous n\'êtes pas dans le même salon que le bot !');
                }
                return false;
            }
        }
        else {
            if (sendMessage) {
                message.channel.send('❌ Je ne suis pas connecté dans un salon !');
            }
            return false;
        }
    }

    showCommandlist(message) {
        let embedDescription = '';
        commands.map(item => {
            embedDescription += item.command + item.exemple;
        });
        message.author.send({
            'embed': {
                'color': 3493780,
                'description': embedDescription,
                'author': {
                    'name': 'Liste des commandes'
                },
                'footer': {
                    'text': 'Détails d\'une commande: `!!help +COMMANDE`'
                }
            }
        });
    }

    getCommandInfos(message, command) {
        const commandObj = commands.filter(c => c.name.split(' | ')[0] === command || c.name.split(' | ')[1] === command);
        if (commandObj && commandObj[0]) {
            let joinedInfos = '';
            commandObj[0].infos.map(info => {
                joinedInfos += info;
            });
            message.author.send({
                'embed': {
                    'color': 3493780,
                    'description': joinedInfos,
                    'author': {
                        'name': commandObj[0].name
                    }
                }
            });
        }
        else {
            message.channel.send('> La commande `' + command + '` n\'existe pas !');
        }

    }
}
