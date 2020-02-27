import Helper from './helper.js';
import Player from './player.js';
import Settings from './settings.js';
import config from './../../config.json';
import Discord from 'discord.js';
import Radios from './../json/radios.json';

export default class Radio {
    constructor(message, words) {
        if (words[1]) {
            const radioChoice = words[2] ? words[1].toLowerCase() + ' ' + words[2].toLowerCase() : words[1].toLowerCase();
            if (words[1].toLowerCase() === 'list') {
                this.showRadioList(message);
            }
            else if (this.radioExist(radioChoice)) {
                this.connectRadio(message, words, radioChoice);
            }
            else {
                message.channel.send('❌ Cette radio n\'existe pas ! \n📻 Tapez **' + config.prefix + 'radio list** pour obtenir la liste des radios disponibles.');
            }
        }
        else {
            message.channel.send('❌ Choisir une radio, c\'est mieux !');
        }
    }

    radioExist(radio) {
        const check = Radios.filter(r => r.name.toLowerCase() === radio);
        if (check && check.length) {
            return true;
        }
        return false;
    }

    showRadioList(message) {
        let stringRadioList = '';
        // Create radio list as string and send it
        Radios.map(r => {
            stringRadioList += '> - **' + r.name + '**\n';
        });
        message.channel.send('> Écrivez le nom de la radio que vous voulez écouter.\n > Ex: ' + config.prefix + 'radio nrj\n > \n ' + stringRadioList);
    }

    connectRadio(message, words, radioChoice, retry = false) {
        const radio = Radios.filter(r => r.name.toLowerCase() === radioChoice)[0];
        const voiceChannel = Helper.take_user_voiceChannel(message);
        if (voiceChannel) {
            // Call player setter/getter to save radio infos
            Player.removeArray(message, 'trytonext');
            Player.removeArray(message, 'loop');
            Player.setArray(message, 'radio', true);
            if (!Player.getArray(message, 'connected')) {
                this.joinChannelAndPlayRadio(message, words, voiceChannel, radio, retry);
            }
            else if (Helper.verifyBotLocation(message, Player.getArray(message, 'connected'), voiceChannel)) {
                if (!retry) {
                    this.sendRadioEmbed(message, radio);
                }
                Player.removeArray(message, 'playlistArray');
                Player.removeArray(message, 'playlistInfos');
                Player.streamDestroy(message);
                const radioStream = Player.getArray(message, 'connections').play(radio.url);
                radioStream.setVolume(0.4);
                Player.setArray(message, 'streams', radioStream);
            }
        }
        else {
            message.channel.send('❌ Vous devez être connecté dans un salon !');
        }
    }

    joinChannelAndPlayRadio(message, words, voiceChannel, radio, retry) {
        voiceChannel.join()
            .then(connection => {
                const setting = Settings.get(message.guild.id);
                if (!retry) {
                    this.sendRadioEmbed(message, radio);
                }
                Player.setArray(message, 'connections', connection);
                Player.setArray(message, 'connected', voiceChannel.id);
                const radioStream = Player.getArray(message, 'connections').play(radio.url);
                radioStream.setVolume(setting ? setting.audio.volume : 0.4);
                Player.setArray(message, 'streams', radioStream);
            })
            .catch(() => {
                setTimeout(() => {
                    this.connectRadio(message, words, true);
                }, 1500);
            });
    }

    sendRadioEmbed(message, radio) {
        const setting = Settings.get(message.guild.id);
        if (!setting || (setting && setting.notif.radio === 'on')) {
            // #543A99 | Mauve
            const radioLink = radio.name.indexOf(' ') !== -1 ? radio.name.toLowerCase().split(' ').join('-') : radio.name.toLowerCase();
            const color = 5520025;
            const embed = new Discord.MessageEmbed()
                .setAuthor('Radio', 'https://syxbot.com/assets/img/radio_icon.png')
                .setColor(color)
                .setFooter('📻 "' + config.prefix + 'radio list" pour afficher les radios disponibles')
                .setThumbnail(`https://syxbot.com/assets/img/radio/${radioLink}.png`)
                .addField('Nom de la radio', radio.name, true);
            message.channel.send({ embed });
        }
    }
}
