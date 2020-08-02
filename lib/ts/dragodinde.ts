'use strict';

import axios from 'axios';
import dateFormat from 'dateformat';
import Config from '../../config.json';
import { Message } from 'discord.js';

type dofusInfosType = {
    notif: string
}

const dofusInfos: dofusInfosType[] = [];

export const controller = (message: Message, words: string[]): Promise<Message> => {
    if (words[1]) {
        if (words[1] === 'notif') {
            return notif(message, words);
        }
    }
    return message.channel.send('❌ Commande incomplète !');
};

export const notif = async (message: Message, words: string[]): Promise<Message> => {
    if (!words[2] || words[2] === 'status') {
        const status = dofusInfos[Number(message.author.id)] ? dofusInfos[Number(message.author.id)].notif.toUpperCase() : 'OFF';
        return message.channel.send('> ** Dragodindes ** \n > `Notifications` : `' + status + '`');
    }
    if (words[2].toLowerCase() === 'on' || words[2].toLowerCase() === 'off') {
        const status = words[2].toLowerCase() === 'on' ? 'on' : 'off';
        if ((!dofusInfos[Number(message.author.id)] && status === 'on') || (dofusInfos[Number(message.author.id)] && dofusInfos[Number(message.author.id)].notif !== status)) {
            const { data } = await axios.post('/api/dofus/dragodindes/notif', {
                userId: message.author.id,
                status: status,
                token: Config.security.token,
                type: 'bot'
            });
            dofusInfos[Number(message.author.id)] = {
                notif: data.notif ? 'on' : 'off'
            };
            return message.channel.send('> ** Dragodindes ** \n > `Notifications` : `' + status.toUpperCase() + '`');
        }
        return message.channel.send('❌ Vous devez écrire une valeur différente de celle actuelle');
    }
    return message.channel.send('❌ Paramètre `' + words[2] + '` introuvable !');
};

export const getInfos = (userId: string): dofusInfosType => {
    return dofusInfos[Number(userId)];
};

export const update = async (): Promise<boolean> => {
    console.log('Updating dragodindes settings ... | ' + dateFormat(Date.now(), 'HH:MM:ss'));
    const { data } = await axios.post('/api/dofus/dragodindes/notif/all', { token: Config.security.token, type: 'bot' });
    if (data) {
        data.map((setting: { userId: string, notif: boolean }) => {
            dofusInfos[Number(setting.userId)] = {
                notif: setting.notif ? 'on' : 'off'
            }
        });
        console.log(' - Dragodindes settings updated !');
        return true;
    }
    return false;
}
