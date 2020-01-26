import config from './../../config.json';
import _ from 'lodash';
import axios from 'axios';

const params = [];

export default class Settings {
    constructor(message, words) {
        if (message) {
            delete words[0];
            words = _.compact(words);
            if (!params[message.guild.id]) {
                params[message.guild.id] = this.setParamObject('on', 'on', 'on', 0.4, 'on');
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

    setParamObject(current, add, remove, volume, radio) {
        return {
            notif: {
                current: current,
                add: add,
                remove: remove,
                radio: radio
            },
            audio: {
                volume: volume
            }
        };
    }

    showParamsList(message) {
        const param = params[message.guild.id];
        const current = '>     current : `' + param.notif.current.toUpperCase() + '`\n';
        const add = '>     add : `' + param.notif.add.toUpperCase() + '`\n';
        const remove = '>     remove : `' + param.notif.remove.toUpperCase() + '`\n';
        const volume = '>     volume : `' + param.audio.volume + '`';
        const radio = '>     radio : `' + param.notif.radio.toUpperCase() + '`\n';
        const listAsString = '> **⚙️ Liste des paramètres du serveur** \n > \n > **Notif [on/off]** 🔔 \n' + current + add + remove + radio + '> \n' + '> **Audio [0...1]** 🎵 \n' + volume;
        message.channel.send(listAsString);
    }

    paramsControl(message, words) {
        if (words[1]) {
            if (params[message.guild.id][words[0]][words[1]]) {
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
        params[message.guild.id][category][param] = value;
        axios.post('https://syxbot.com/api/settings/update', params[message.guild.id])
            .then(res => {
                console.log('res status : ', res.status);
                console.log('res : ', res.data);
            })
            .catch(e => {
                if (e.response) {
                    console.log('E : ', e.response.status);
                }
            });
    }

    static get(message) {
        return params[message.guild.id];
    }

    static update() {
        // Call api to get settings in database
    }
}