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
                settings[message.guild.id] = this.setParamObject(message.guild.id, 'on', 'on', 'on', 0.4, 'on');
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

    setParamObject(guildId, current, added, removed, volume, radio) {
        return {
            guildId: guildId,
            notif: {
                current: current,
                added: added,
                removed: removed,
                radio: radio
            },
            audio: {
                volume: volume
            }
        };
    }

    showParamsList(message) {
        const settingsObj = settings[message.guild.id];
        const current = '>     current : `' + settingsObj.notif.current.toUpperCase() + '`\n';
        const added = '>     added : `' + settingsObj.notif.added.toUpperCase() + '`\n';
        const removed = '>     removed : `' + settingsObj.notif.removed.toUpperCase() + '`\n';
        const volume = '>     volume : `' + settingsObj.audio.volume + '`';
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

    setParams(message, category, param, value) {
        if (settings[message.guild.id][category][param] !== value) {
            const cloneSettings = settings[message.guild.id];
            cloneSettings[category][param] = isFinite(value) ? value : value.toLowerCase();
            axios.post('https://syxbot.com/api/settings/update', cloneSettings)
                .then(res => {
                    if (res.data) {
                        settings[message.guild.id][category][param] = isFinite(value) ? value : value.toLowerCase();
                        message.channel.send('✅ Paramètre modifié => `' + param + '` : `' + isFinite(value) ? value : value.toUpperCase() + '`');
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
                console.log('lib settings error while update settings : ', e.message);
                return false;
            });
    }
}