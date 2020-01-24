import config from './../../config.json';
import _ from 'lodash';

const params = [];

export default class Settings {
    constructor(message, words) {
        if (message) {
            delete words[0];
            words = _.compact(words);
            params[message.guild.id] = {
                music: {
                    current: true,
                    add: true,
                    remove: true
                },
                radio: true
            };
            if (words[0]) {
                if (words[0].toLowerCase() === 'radio') {
                    console.log('radio array : ', params[message.guild.id][words[0]]);
                }
                else if (words[0].toLowerCase() === 'music') {
                    this.setMusicSettings(message, words);
                }
                else {
                    message.channel.send('❌ Le paramètre `' + words[0] + '` n\'existe pas \n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
                }
            }
            else {
                message.channel.send('❌ Veuillez écrire les paramètres à modifier \n⌨️ Ex: `' + config.prefix + 'set music current off`\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
            }
        }
    }

    setMusicSettings(message, words) {
        if (words[1]) {
            if (words[2] && (words[2].toLowerCase() === 'on' || words[2].toLowerCase() === 'off')) {
                console.log('music array : ', params[message.guild.id][words[0]][words[1]]);
                console.log('set to value : ', words[2]);
            }
            else {
                message.channel.send('❌ Veuillez écrire une valeur (on/off)\n⌨️ Ex: `' + config.prefix + 'set ' + words[0] + ' ' + words[1] + ' off`');
            }
        }
        else {
            message.channel.send('❌ Veuillez écrire le paramètre à modifier \n⌨️ Ex: `' + config.prefix + 'set music current off`\n⚙️ Afficher les paramètres : `' + config.prefix + 'set list`');
        }
    }

    static getParam(message, param) {
        return params[message.guild.id][param];
    }

    static updateParams() {
        // Call api to get settings in database
    }
}