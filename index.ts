import Discord, { VoiceChannel, Message, MessageReaction, User, PartialUser } from 'discord.js';
import dateFormat from 'dateformat';
import { Controller } from './lib/ts/controller';
import * as Helper from './lib/ts/helper';
import * as Player from './lib/ts/player';
import * as Settings from './lib/ts/settings';
import { update as dragodindeUpdate, verifyNotif } from './lib/ts/dragodinde';
import { APIsessionType } from './lib/@types/session';
import config from './config.json';
import Axios from 'axios';
import chalk from 'chalk';
// import Streams from './lib/js/streams';
// const mongoose = require('mongoose');

const bot = new Discord.Client();
let APIsession: APIsessionType = {} as APIsessionType;

console.log(' ');
console.log('----- ' + dateFormat(Date.now(), 'HH:MM:ss dd/mm/yyyy') + ' -----');

// connectToDatabase();

bot.on('ready', (): void => {
    disconnectBotFromOldChannel();
    // new Streams(bot);
    bot.user?.setActivity(`${config.prefix}help`, { type: 'PLAYING' })
        .catch(e => console.log('Error while set presence : ', e.message));
    if (config.env === 'DEV') console.log(chalk.bgRgb(60, 121, 0)('\n         CONNECTED          '));
    if (config.env === 'DEV') {
        console.log('      Connected => ' + config.env);
        console.log('      Guilds =>', bot.guilds.cache.size);
    }
    else {
        console.log(' ');
        console.log('Connected => ' + config.env);
        console.log('Guilds =>', bot.guilds.cache.size);
    }
    // Verify if dragodindes notif need to be send
    verifyNotif(bot, APIsession);
    // Keep bot connection alive & activity (send signal every 6H)
    setInterval(() => {
        Axios.post('https://syxbot.com/api/', { ...APIsession });
        bot.user?.setActivity(`${config.prefix}help`, { type: 'PLAYING' })
            .catch(e => console.log('Error while set presence in shard reconnecting: ', e.message));
    }, (1000 * 60 * 60 * 6));
});

bot.on('message', (message: Message): void => {
    if (message.type === 'GUILD_MEMBER_JOIN' && message.author.id === config.clientId) {
        message.channel.send('🖐 **Salut !** 🖐\n\n'
            + '🔑 Mon préfix est : `' + config.prefix + '` \n'
            + '❓ Pour afficher la liste des commandes faites : `' + config.prefix + 'help`');
    }
    else if (message.content.toLowerCase().startsWith(config.prefix) && message.content.indexOf('!!!') === -1)
        Controller(message, config.prefix, bot);
    // else if (message.author.id !== config.clientId) {
    //     Level.addXp(message);
    // }
});

bot.on('shardReconnecting', (id): void => {
    console.log(`Shard reconnected, ID => ${id} => ${dateFormat(Date.now(), 'HH:MM:ss')}`);
});

// bot.on('shardResume', (replayed, shardID): void => {
//     console.log(`Shard ID ${shardID} resumed connection and replayed ${replayed} events.`);
// });

bot.on('messageReactionAdd', (reaction: MessageReaction, user: User | PartialUser): void | Promise<void | Message> => {
    if (!user.bot) {
        const playlistExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search pl 1') !== -1;
        const videoExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search p 2') !== -1;
        if (playlistExist || videoExist) {
            const selection = getSelectionByReaction(reaction);
            if (reaction.emoji.name === '⏩')
                return nextReaction(reaction, user as User, playlistExist ? 'playlist' : 'video');
            const type = playlistExist ? 'playlist' : 'musique';
            return Player.selectSongInSearchList(reaction.message, selection, type, [true, user]);
        }
    }
});

const nextReaction = (reaction: MessageReaction, user: User, type: string): void | Promise<Message> => {
    const userChannel = Helper.take_user_voiceChannel_by_reaction(reaction.message, user);
    if (userChannel)
        return Player.youtubeResearch(reaction.message, null, type, false, [true, user]);
    return reaction.message.channel.send('❌ Vous devez être connecté dans un salon !');
};

const getSelectionByReaction = (reaction: MessageReaction): number | false => {
    if (reaction.emoji.name === '1️⃣') return 1;
    if (reaction.emoji.name === '2️⃣') return 2;
    if (reaction.emoji.name === '3️⃣') return 3;
    if (reaction.emoji.name === '4️⃣') return 4;
    if (reaction.emoji.name === '5️⃣') return 5;
    return false;
};

// function connectToDatabase() {
//     console.log('----- Starting -----');
//     console.log('Connecting to database ...');
//     mongoose.connect('mongodb://localhost/syxbot-database', {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         autoIndex: false,
//         useFindAndModify: false
//     });
//     mongoose.connection.once('open', () => {
//         console.log('Connected to database !');
//         updateSettings();
//     });
// }

const start = async (): Promise<void> => {
    const session = await createAPIsession();
    if (session) {
        const status = await updateSettings();
        if (status && session) bot.login(config.token);
    }
};

const createAPIsession = async (): Promise<boolean> => {
    // Call API to create session
    try {
        const session = await Axios.post('/api/bot/auth', {
            token: config.security.token,
            type: 'bot'
        });
        APIsession = {
            jwt: session.data.jwt,
            token: config.security.token,
            type: 'bot'
        };
        return true;
    }
    catch (e) {
        console.log('Error while creating api session : ', e.message);
        return false;
    }
};

export const getAPIsession = (): APIsessionType => {
    return APIsession;
};

const updateSettings = async (): Promise<void | boolean> => {
    if (config.env === 'DEV') console.log(chalk.bgRgb(215, 102, 8)('          SETTINGS          '));
    if (await Settings.update(APIsession)) {
        if (await dragodindeUpdate(APIsession)) {
            if (config.env === 'DEV') console.log(chalk.bgRgb(25, 108, 207)('\n         CONNECTION         '));
            return true;
        }
    }
};

const disconnectBotFromOldChannel = (): void => {
    console.log('Disconnecting from all channels ...');
    bot.guilds.cache.map(g => {
        g.channels.cache.map(channel => {
            if (channel.type === 'voice') {
                if (channel.members) {
                    channel.members.map(member => {
                        if (member.user.bot && member.user.id === config.clientId) {
                            (channel as VoiceChannel).join()
                                .then(connection => {
                                    connection.channel.leave();
                                })
                                .catch(e => {
                                    console.log('error while disconnecting at start : ', e.message);
                                });
                        }
                    });
                }
            }
        });
    });
    console.log(' - Disconnected from all channels !');
};

process.on('SIGINT', async (): Promise<void> => {
    // close connections, clear cache, etc
    try {
        console.log('Close api session');
        await Axios.post('/api/bot/auth/close', { ...APIsession });
    }
    catch (e) {
        console.log('Error while closing api session : ', e.message);
    }
    process.exit(0);
});

start();
