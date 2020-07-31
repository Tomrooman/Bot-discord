'use strict';

import dateFormat from 'dateformat';
import _, { clone } from 'lodash';
import axios from 'axios';
import config from '../../config.json';

type settingsType = {
    guildId: string,
    notif: {
        current: string,
        added: string,
        removed: string,
        radio: string
    },
    audio: {
        volume: number
    }
}

const settings: settingsType[] = [];

export default class Settings {
    constructor(message, words) {
        if (message) {
            delete words[0];
            words = _.compact(words);
            if (!settings[message.guild.id]) {
                settings[message.guild.id] = this.setParamObject(message);
            }
            if (words[0]) {
                if (words[0].toLowerCase() === 'list') {
                    return this.showParamsList(message);
                }
                else if (words[0].toLowerCase() === 'notif' || words[0].toLowerCase() === 'audio') {
                    return this.paramsControl(message, words);
                }
                return message.channel.send('❌ Le paramètre `' + words[0] + '` n\'existe pas \n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
            }
            return message.channel.send('❌ Veuillez écrire les paramètres à modifier \n⌨️ Ex: `' + config.prefix + 'set notif current off`\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
        }
    }

    setParamObject(message) {
        return {
            guildId: message.guild.id,
            notif: {
                current: 'on',
                added: 'on',
                removed: 'on',
                radio: 'on'
            },
            audio: {
                volume: 0.4
            }
        };
    }

    showParamsList(message) {
        const settingsObj = settings[message.guild.id];
        const current = '>     actuel : `' + settingsObj.notif.current.toUpperCase() + '`\n';
        const added = '>     rajout : `' + settingsObj.notif.added.toUpperCase() + '`\n';
        const removed = '>     suppression : `' + settingsObj.notif.removed.toUpperCase() + '`\n';
        const volume = '>     volume : `' + settingsObj.audio.volume + '`\n';
        const radio = '>     radio : `' + settingsObj.notif.radio.toUpperCase() + '`\n';
        const listAsString = '> **⚙️ Paramètres du serveur** \n > \n > **Notif [on/off]** 🔔 \n' + current + added + removed + radio + '> \n' + '> **Audio [0...1]** 🔊 \n' + volume;
        return message.channel.send(listAsString);
    }

    paramsControl(message, words) {
        if (words[1]) {
            const convertedParam = this.paramConvertor(words[1]);
            if (settings[message.guild.id][words[0]][convertedParam]) {
                if (words[2]) {
                    if (words[2].toLowerCase() === 'on' || words[2].toLowerCase() === 'off' || (isFinite(words[2]) && words[2] >= 0 && words[2] <= 1)) {
                        if (words[1] === 'volume' && isFinite(words[2])) {
                            return this.setParams(message, words[0], words[1], words[2], convertedParam);
                        }
                        else if (words[0] === 'notif' && !isFinite(words[2])) {
                            return this.setParams(message, words[0], words[1], words[2], convertedParam);
                        }
                        return message.channel.send('❌ `' + words[2] + '` n\'est pas une valeur acceptable');
                    }
                    return message.channel.send('❌ `' + words[2] + '` n\'est pas une valeur acceptable');
                }
                return message.channel.send('❌ Veuillez écrire une valeur\n⌨️ Ex: `' + config.prefix + 'set ' + words[0] + ' ' + words[1] + (words[1] === 'volume' ? ' 0.4' : ' off') + '`');
            }
            return message.channel.send('❌ Le paramètre `' + words[1] + '` n\'existe pas\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
        }
        return message.channel.send('❌ Veuillez écrire le paramètre à modifier \n⌨️ Ex: `' + config.prefix + 'set notif current off`\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
    }

    paramConvertor(word) {
        if (word === 'actuel') {
            return 'current';
        }
        else if (word === 'rajout') {
            return 'added';
        }
        else if (word === 'suppression') {
            return 'removed';
        }
        return word;
    }

    // setStreamsParams(message, category, param, value) {
    //     if (settings[message.guild.id][category][param].status !== value) {
    //         const cloneSettings = settings[message.guild.id];
    //         cloneSettings[category][param].status = value;
    //         cloneSettings[category][param].channelID = message.channel.id;
    //         cloneSettings[category][param].channelName = message.channel.name;
    //         cloneSettings['token'] = config.security.token
    //         cloneSettings['type'] = 'bot';
    //         axios.post('https://syxbot.com/api/settings/update', cloneSettings)
    //             .then(res => {
    //                 if (res.data) {
    //                     settings[message.guild.id][category][param].status = value;
    //                     if (value === 'on') {
    //                         settings[message.guild.id][category][param].channelID = message.channel.id;
    //                         settings[message.guild.id][category][param].channelName = message.channel.name;
    //                         message.channel.send('✅ Les messages `' + category + '` pour `' + param + '` sont activés !\n⚙️ Channel définit sur `' + message.channel.name + '`');
    //                     }
    //                     else {
    //                         message.channel.send('✅ Les messages `' + category + '` pour `' + param + '` sont désactivés !');
    //                     }
    //                 }
    //                 else {
    //                     setTimeout(() => {
    //                         this.setStreamsParams(message, category, param, value);
    //                     }, 1000);
    //                 }
    //             })
    //             .catch(e => {
    //                 if (e.response) {
    //                     console.log('Set streams params error : ', e.response.status);
    //                 }
    //                 setTimeout(() => {
    //                     this.setStreamsParams(message, category, param, value);
    //                 }, 1000);
    //             });
    //     }
    //     else {
    //         message.channel.send('❌ Vous devez écrire une valeur différente de celle actuelle');
    //     }
    // }

    async setParams(message, category, param, value, convertedParam) {
        if (settings[message.guild.id][category][convertedParam] !== value) {
            const cloneSettings = settings[message.guild.id];
            cloneSettings[category][convertedParam] = isFinite(value) ? value : value.toLowerCase();
            cloneSettings['token'] = config.security.token;
            cloneSettings['type'] = 'bot';
            const { data } = await axios.post('/api/settings/update', cloneSettings);
            if (data) {
                settings[message.guild.id][category][convertedParam] = isFinite(value) ? value : value.toLowerCase();
                return message.channel.send('✅ Paramètre modifié => `' + param + '` : `' + (isFinite(value) ? value : value.toUpperCase()) + '`');
            }
            return message.channel.send('❌ Erreur lors de la mise à jour des paramètres, veuillez réessayer');
        }
        return message.channel.send('❌ Vous devez écrire une valeur différente de celle actuelle');
    }

    static get(guildId) {
        return settings[guildId];
    }

    static getAll() {
        return settings;
    }

    static async update() {
        console.log('Updating server settings ... | ' + dateFormat(Date.now(), 'HH:MM:ss'));
        const { data } = await axios.post('/api/settings/', { token: config.security.token, type: 'bot' });
        if (data) {
            data.map(setting => {
                settings[setting.guildId] = {
                    guildId: setting.guildId,
                    notif: {
                        current: setting.notif.current,
                        added: setting.notif.added,
                        removed: setting.notif.removed,
                        radio: setting.notif.radio
                    },
                    audio: {
                        volume: setting.audio.volume
                    }
                };
            });
            console.log(' - Server settings updated !');
            return true;
        }
        setTimeout(() => {
            Settings.update()
        }, 1000);
    }
}