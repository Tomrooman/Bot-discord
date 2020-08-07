'use strict';

import axios from 'axios';
import dateFormat from 'dateformat';
import Config from '../../config.json';
import { Message, Client, User, MessageEmbed } from 'discord.js';
import { notifArrayType, userNotifInfos, dragodindeType } from './../@types/dragodinde';
import { APIsessionType } from '../@types/session';
import { getAPIsession } from '../../index';

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
            const session: APIsessionType = getAPIsession();
            const { data } = await axios.post('/api/dofus/dragodindes/notif', {
                userId: message.author.id,
                status: status,
                ...session
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

export const verifyNotif = async (bot: Client, session: APIsessionType): Promise<void> => {
    setInterval(async (): Promise<void> => {
        try {
            const { data } = await axios.post('/api/dofus/dragodindes/notif/verify', { ...session });
            if (data && data.length) {
                data.map(async (infos: notifArrayType) => {
                    const user = bot.users.cache.get(infos.userId);
                    if (user) {
                        await sendNotifMessage(user, infos.dragodindes);
                    }
                });
            }
        } catch (e) {
            console.log('Error while verifying dragodindes notif, retrying ... : ', e.message);
        }
    }, 1000 * 60 * 2);
};

const sendNotifMessage = async (user: User, dragodindes: dragodindeType[]): Promise<void> => {
    const dragodindesStr = getdragodindesAsString(dragodindes);
    const embed = new MessageEmbed()
        .setAuthor('🔔 Dofus - notifications')
        .setThumbnail('https://syxbot.com/assets/img/dofus.png')
        .setColor('#7DBD26')
        .setFooter('\u200b \n ❔ "' + Config.prefix + 'drago notif off" pour désactiver ces messages')
        .setDescription('\u200b \n **Dragodindes prêtes** ✅ \n' + dragodindesStr)
    await user.send({ embed });
};

const getdragodindesAsString = (dragodindes: dragodindeType[]): string => {
    let dragoStr = '\n';
    dragodindes.map((drago: dragodindeType) => {
        dragoStr += ' **-** ' + drago.name + '\n';
    });
    return dragoStr;
};

export const getInfos = (userId: string): dofusInfosType => {
    return dofusInfos[Number(userId)];
};

export const update = async (session: any): Promise<boolean | undefined> => {
    try {
        console.log('Updating dragodindes settings ... | ' + dateFormat(Date.now(), 'HH:MM:ss'));
        const { data } = await axios.post('/api/dofus/dragodindes/notif/all', { ...session });
        if (data) {
            data.map((setting: userNotifInfos) => {
                dofusInfos[Number(setting.userId)] = {
                    notif: setting.notif ? 'on' : 'off'
                }
            });
            console.log(' - Dragodindes settings updated !');
            return true;
        }
    } catch (e) {
        console.log('Error while updating dragodindes settings, retrying ... : ', e.message);
        setTimeout(async (): Promise<void> => {
            await update(session);
        }, 5000);
    }
}
