'use strict';

import { Message as DMessage, TextChannel } from 'discord.js';

const removeInfos: number[] = [];

export const instantiate = (message: DMessage, words: string[], all = ''): void | Promise<DMessage> => {
    if (all !== '') {
        return remove(message, 0, true);
    }
    if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
        return remove(message, parseInt(words[1]));
    }
    return message.channel.send('❌ Vous devez écrire le nombre de messages que vous voulez supprimer.');
};

const remove = (message: DMessage, howMany: number, all = false): void | Promise<DMessage> => {
    if (message && message.guild) {
        if (howMany > 99) {
            return message.channel.send('❌ Écrivez un chiffre inférieur ou égal à 99');
        }
        if (removeInfos[Number(message.guild.id)]) {
            return message.channel.send('❌ Vous devez attendre la confirmation de suppression des messages');
        }
        removeInfos[Number(message.guild.id)] = 0;
        let limit = {};
        if (!all) {
            limit = {
                limit: howMany + 1
            };
        }
        removeMessages(message, limit);
    }
    return;
};

const removeMessages = (message: DMessage, limit: { limit?: number }): void => {
    if (message && message.guild) {
        const guildID = message.guild.id;
        message.channel.messages.fetch(limit)
            .then(messages => {
                (message.channel as TextChannel).bulkDelete(messages)
                    .then(() => {
                        message.channel.send('✅ **' + (messages.size - 1) + '** ' + (messages.size - 1 > 1 ? 'messages supprimés' : 'message supprimé'));
                        delete removeInfos[guildID];
                    })
                    .catch(() => messages.map(oneMessage => {
                        oneMessage.delete({ timeout: 4000 })
                            .then(() => {
                                removeInfos[guildID]++;
                                if (removeInfos[guildID] === messages.size) {
                                    message.channel.send('✅ **' + (messages.size - 1) + '** ' + (messages.size - 1 > 1 ? 'messages supprimés' : 'message supprimé'));
                                    delete removeInfos[guildID];
                                }
                            })
                            .catch((e) => {
                                console.log('Erreur de suppression du message : ', e.message);
                            });
                    }));
            })
            .catch(console.error);
    }
};
