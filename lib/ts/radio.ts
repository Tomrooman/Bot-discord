'use strict';

import Helper from './helper';
import Player from './player';
import Settings from './settings';
import config from '../../config.json';
import Discord, { VoiceConnection, Message, VoiceChannel } from 'discord.js';
import Radios from '../json/radios.json';

export default class Radio {
    constructor(message: Message, words: string[]) {
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

    radioExist(radio: string): boolean {
        const check = Radios.filter(r => r.name.toLowerCase() === radio);
        if (check && check.length) {
            return true;
        }
        return false;
    }

    showRadioList(message: Message): void {
        let stringRadioList = '';
        // Create radio list as string and send it
        Radios.map(r => {
            stringRadioList += '> - **' + r.name + '**\n';
        });
        message.channel.send('> Écrivez le nom de la radio que vous voulez écouter.\n > Ex: ' + config.prefix + 'radio nrj\n > \n ' + stringRadioList);
    }

    connectRadio(message: Message, words: string[], radioChoice: string = '', retry: boolean = false): void {
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
                const radioStream = (Player.getArray(message, 'connections') as VoiceConnection).play(radio.url);
                radioStream.setVolume(0.4);
                Player.setArray(message, 'streams', radioStream);
            }
        }
        else {
            message.channel.send('❌ Vous devez être connecté dans un salon !');
        }
    }

    joinChannelAndPlayRadio(message: Message, words: string[], voiceChannel: VoiceChannel, radio: { name: string, url: string }, retry: boolean): void {
        voiceChannel.join()
            .then(connection => {
                const setting = Settings.get(String(message.guild?.id));
                if (!retry) {
                    this.sendRadioEmbed(message, radio);
                }
                Player.setArray(message, 'connections', connection);
                Player.setArray(message, 'connected', voiceChannel.id);
                const radioStream = (Player.getArray(message, 'connections') as VoiceConnection).play(radio.url);
                radioStream.setVolume(setting ? setting.audio.volume : 0.4);
                Player.setArray(message, 'streams', radioStream);
            })
            .catch(() => {
                setTimeout(() => {
                    this.connectRadio(message, words);
                }, 1500);
            });
    }

    sendRadioEmbed(message: Message, radio: { name: string, url: string }): void {
        const setting = Settings.get(String(message.guild?.id));
        if (!setting || (setting && setting.notif.radio === 'on')) {
            // #543A99 | Mauve
            const color = 5520025;
            const embed = new Discord.MessageEmbed()
                .setAuthor('Radio', 'https://syxbot.com/assets/img/radio_icon.png')
                .setColor(color)
                .setFooter('📻 "' + config.prefix + 'radio list" pour afficher les radios disponibles')
                .setThumbnail(`https://syxbot.com/assets/img/radio/${radio.name.toLowerCase()}.png`)
                .addField('Nom de la radio', radio.name, true);
            message.channel.send({ embed });
        }
    }
}
