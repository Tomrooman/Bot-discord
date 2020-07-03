import dateFormat from 'dateformat';
import _ from 'lodash';
import axios from 'axios';
import config from './../../config.json';

const settings = [];

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
                    this.showParamsList(message);
                }
                else if (words[0].toLowerCase() === 'notif' || words[0].toLowerCase() === 'audio') {
                    this.paramsControl(message, words);
                }
                else {
                    message.channel.send('❌ Le paramètre `' + words[0] + '` n\'existe pas \n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
                }
            }
            else {
                message.channel.send('❌ Veuillez écrire les paramètres à modifier \n⌨️ Ex: `' + config.prefix + 'set notif current off`\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
            }
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
        const current = '>     current : `' + settingsObj.notif.current.toUpperCase() + '`\n';
        const added = '>     added : `' + settingsObj.notif.added.toUpperCase() + '`\n';
        const removed = '>     removed : `' + settingsObj.notif.removed.toUpperCase() + '`\n';
        const volume = '>     volume : `' + settingsObj.audio.volume + '`\n';
        const radio = '>     radio : `' + settingsObj.notif.radio.toUpperCase() + '`\n';
        const listAsString = '> **⚙️ Liste des paramètres du serveur** \n > \n > **Notif [on/off]** 🔔 \n' + current + added + removed + radio + '> \n' + '> **Audio [0...1]** 🔊 \n' + volume;
        message.channel.send(listAsString);
    }

    paramsControl(message, words) {
        if (words[1]) {
            if (settings[message.guild.id][words[0]][words[1]]) {
                if (words[2]) {
                    if (words[2].toLowerCase() === 'on' || words[2].toLowerCase() === 'off' || (isFinite(words[2]) && words[2] >= 0 && words[2] <= 1)) {
                        if (words[1] === 'volume' && isFinite(words[2])) {
                            this.setParams(message, words[0], words[1], words[2]);
                        }
                        else if (words[0] === 'notif' && !isFinite(words[2])) {
                            this.setParams(message, words[0], words[1], words[2]);
                        }
                        else {
                            message.channel.send('❌ `' + words[2] + '` n\'est pas une valeur acceptable');
                        }
                    }
                    else {
                        message.channel.send('❌ `' + words[2] + '` n\'est pas une valeur acceptable');
                    }
                }
                else {
                    message.channel.send('❌ Veuillez écrire une valeur\n⌨️ Ex: `' + config.prefix + 'set ' + words[0] + ' ' + words[1] + (words[1] === 'volume' ? ' 0.4' : ' off') + '`');
                }
            }
            else {
                message.channel.send('❌ Le paramètre `' + words[1] + '` n\'existe pas\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
            }
        }
        else {
            message.channel.send('❌ Veuillez écrire le paramètre à modifier \n⌨️ Ex: `' + config.prefix + 'set notif current off`\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
        }
    }

    // setStreamsParams(message, category, param, value) {
    //     if (settings[message.guild.id][category][param].status !== value) {
    //         const cloneSettings = settings[message.guild.id];
    //         cloneSettings[category][param].status = value;
    //         cloneSettings[category][param].channelID = message.channel.id;
    //         cloneSettings[category][param].channelName = message.channel.name;
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

    setParams(message, category, param, value) {
        if (settings[message.guild.id][category][param] !== value) {
            const cloneSettings = settings[message.guild.id];
            cloneSettings[category][param] = isFinite(value) ? value : value.toLowerCase();
            axios.post('/api/settings/update', cloneSettings)
                .then(res => {
                    if (res.data) {
                        settings[message.guild.id][category][param] = isFinite(value) ? value : value.toLowerCase();
                        message.channel.send('✅ Paramètre modifié => `' + param + '` : `' + (isFinite(value) ? value : value.toUpperCase()) + '`');
                    }
                    else {
                        setTimeout(() => {
                            this.setParams(message, category, param, value);
                        }, 1000);
                    }
                })
                .catch(e => {
                    if (e.response) {
                        console.log('E : ', e.response.status);
                    }
                    setTimeout(() => {
                        this.setParams(message, category, param, value);
                    }, 1000);
                });
        }
        else {
            message.channel.send('❌ Vous devez écrire une valeur différente de celle actuelle');
        }
    }

    static get(guildId) {
        return settings[guildId];
    }

    static getAll() {
        return settings;
    }

    static update() {
        console.log('Updating settings ... | ' + dateFormat(Date.now(), 'HH:MM:ss'));
        return axios.get('https://syxbot.com/api/settings/')
            .then(res => {
                if (!res) {
                    return false;
                }
                res.data.map(setting => {
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
                console.log(' - Settings updated !');
                return true;
            })
            .catch((e) => {
                console.log('lib settings error while updating settings : ', e.message);
                return false;
            });
    }
}