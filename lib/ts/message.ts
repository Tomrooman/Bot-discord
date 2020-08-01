'use strict';

import { Message as DMessage } from 'discord.js';

const removeInfos: number[] = [];

export default class Message {
    constructor(message: DMessage, words: string[], all: string = '') {
        if (all !== '') {
            this.remove(message, 0, true);
        }
        else if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
            this.remove(message, parseInt(words[1]));
        }
        else {
            message.channel.send('❌ Vous devez écrire le nombre de messages que vous voulez supprimer.');
        }
    }

    remove(message: DMessage, howMany: number, all: boolean = false) {
        if (message && message.guild) {
            if (howMany > 99) {
                message.channel.send('❌ Écrivez un chiffre inférieur ou égal à 99');
            }
            else if (removeInfos[Number(message.guild.id)]) {
                message.channel.send('❌ Vous devez attendre la confirmation de suppression des messages');
            }
            else {
                removeInfos[Number(message.guild.id)] = 0;
                let limit = {};
                if (!all) {
                    limit = {
                        limit: howMany + 1
                    };
                }
                this.removeMessages(message, limit);
            }
        }
    }

    removeMessages(message: DMessage, limit: { limit?: number }) {
        if (message && message.guild) {
            message.channel.messages.fetch(limit)
                .then(messages => {
                    message.channel.bulkDelete(messages)
                        .then(() => {
                            message.channel.send('✅ **' + (messages.size - 1) + '** ' + (messages.size - 1 > 1 ? 'messages supprimés' : 'message supprimé'));
                            delete removeInfos[Number(message.guild?.id)];
                        })
                        .catch(() => messages.map(oneMessage => {
                            oneMessage.delete({ timeout: 4000 })
                                .then(() => {
                                    removeInfos[Number(message.guild?.id)]++;
                                    if (removeInfos[Number(message.guild?.id)] === messages.size) {
                                        message.channel.send('✅ **' + (messages.size - 1) + '** ' + (messages.size - 1 > 1 ? 'messages supprimés' : 'message supprimé'));
                                        delete removeInfos[Number(message.guild?.id)];
                                    }
                                })
                                .catch((e) => {
                                    console.log('Erreur de suppression du message : ', e.message);
                                });
                        }));
                })
                .catch(console.error);
        }
    }
}
