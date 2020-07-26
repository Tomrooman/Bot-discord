'use strict';

const removeInfos: number[] = [];

export default class Message {
    constructor(message, words, all = '') {
        if (all !== '') {
            this.remove(message, 'all');
        }
        else if (words[1] && Number.isFinite(parseInt(words[1])) && parseInt(words[1]) > 0) {
            this.remove(message, parseInt(words[1]));
        }
        else {
            message.channel.send('❌ Vous devez écrire le nombre de messages que vous voulez supprimer.');
        }
    }

    remove(message, howMany) {
        if (howMany > 99) {
            message.channel.send('❌ Écrivez un chiffre inférieur ou égal à 99');
        }
        else if (removeInfos[message.guild.id]) {
            message.channel.send('❌ Vous devez attendre la confirmation de suppression des messages');
        }
        else {
            removeInfos[message.guild.id] = 0;
            let limit = {};
            if (howMany !== 'all') {
                limit = {
                    limit: parseInt(howMany) + 1
                };
            }
            this.removeMessages(message, limit);
        }
    }

    removeMessages(message, limit) {
        message.channel.messages.fetch(limit)
            .then(messages => {
                message.channel.bulkDelete(messages)
                    .then(() => {
                        message.channel.send('✅ **' + (messages.size - 1) + '** ' + (messages.size - 1 > 1 ? 'messages supprimés' : 'message supprimé'));
                        delete removeInfos[message.guild.id];
                    })
                    .catch(() => messages.map(oneMessage => {
                        oneMessage.delete({ timeout: 4000 })
                            .then(() => {
                                removeInfos[message.guild.id]++;
                                if (removeInfos[message.guild.id] === messages.size) {
                                    message.channel.send('✅ **' + (messages.size - 1) + '** ' + (messages.size - 1 > 1 ? 'messages supprimés' : 'message supprimé'));
                                    delete removeInfos[message.guild.id];
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
