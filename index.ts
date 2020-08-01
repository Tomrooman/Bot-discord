import Discord, { VoiceChannel, Message, MessageReaction, User, PartialUser } from 'discord.js';
import dateFormat from 'dateformat';
import Controller from './lib/ts/controller';
import Helper from './lib/ts/helper';
import Player from './lib/ts/player';
import Settings from './lib/ts/settings';
import { update as dragodindeUpdate } from './lib/ts/dragodinde';
import config from './config.json';
import Axios from 'axios';
import chalk from 'chalk';
// import Streams from './lib/js/streams';
// import Level from './lib/js/level';
// const mongoose = require('mongoose');

const bot = new Discord.Client();

console.log(' ');
console.log('----- ' + dateFormat(Date.now(), 'HH:MM:ss dd/mm/yyyy') + ' -----');

// connectToDatabase();
updateSettings();


bot.on('ready', () => {
    disconnectBotFromOldChannel();
    // new Streams(bot);
    bot.user!.setActivity(`${config.prefix}help`, { type: 'PLAYING' })
        .catch(e => console.log('Error while set presence : ', e.message));
    if (config.WHAT === 'DEV') console.log(chalk.bgRgb(60, 121, 0)(`\n         CONNECTED          `));
    if (config.WHAT === 'DEV') {
        console.log('      Connected => ' + config.WHAT);
        console.log('      Guilds =>', bot.guilds.cache.size);
    }
    else {
        console.log(' ');
        console.log('Connected => ' + config.WHAT);
        console.log('Guilds =>', bot.guilds.cache.size);
    }
    // Keep bot connection alive & activity (send signal every 6H)
    setInterval(() => {
        Axios.post('https://syxbot.com/api/', { token: config.security.token, type: 'bot' });
        bot.user!.setActivity(`${config.prefix}help`, { type: 'PLAYING' })
            .catch(e => console.log('Error while set presence in shard reconnecting: ', e.message));
    }, (1000 * 60 * 60 * 6));
});

bot.on('message', (message: Message) => {
    if (message.type === 'GUILD_MEMBER_JOIN' && message.author.id === config.clientId) {
        message.channel.send('🖐 **Salut !** 🖐\n\n🔑 Mon préfix est : `' + config.prefix + '` \n❓ Pour afficher la liste des commandes faites : `' + config.prefix + 'help`');
    }
    else if (message.content.toLowerCase().startsWith(config.prefix) && message.content.indexOf('!!!') === -1) {
        Controller(message, config.prefix, bot);
    }
    // else if (message.author.id !== config.clientId) {
    //     Level.addXp(message);
    // }
});

bot.on('shardReconnecting', id => {
    console.log(`Shard reconnected, ID => ${id}`);
});

bot.on('shardResume', (replayed, shardID) => {
    console.log(`Shard ID ${shardID} resumed connection and replayed ${replayed} events.`);
});

bot.on('messageReactionAdd', (reaction: MessageReaction, user: User | PartialUser) => {
    if (!user.bot) {
        const playlistExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search pl 1') !== -1;
        const videoExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search p 2') !== -1;
        if (playlistExist || videoExist) {
            const selection = getSelectionByReaction(reaction);
            if (reaction.emoji.name === '⏩') {
                nextReaction(reaction, user as User, playlistExist ? 'playlist' : 'video');
            }
            else {
                new Player().selectSongInSearchList(reaction.message, selection, playlistExist ? 'playlist' : 'musique', [true, user]);
            }
        }
    }
});

function nextReaction(reaction: MessageReaction, user: User, type: string) {
    const userChannel = Helper.take_user_voiceChannel_by_reaction(reaction.message, user);
    if (userChannel) {
        new Player().youtubeResearch(reaction.message, null, type, false, [true, user]);
    }
    else {
        reaction.message.channel.send('❌ Vous devez être connecté dans un salon !');
    }
}

function getSelectionByReaction(reaction: MessageReaction) {
    if (reaction.emoji.name === '1️⃣') {
        return 1;
    }
    if (reaction.emoji.name === '2️⃣') {
        return 2;
    }
    if (reaction.emoji.name === '3️⃣') {
        return 3;
    }
    if (reaction.emoji.name === '4️⃣') {
        return 4;
    }
    if (reaction.emoji.name === '5️⃣') {
        return 5;
    }
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

async function updateSettings() {
    if (config.WHAT === 'DEV') console.log(chalk.bgRgb(215, 102, 8)('          SETTINGS          '));
    await Settings.update();
    await dragodindeUpdate();
    if (config.WHAT === 'DEV') console.log(chalk.bgRgb(25, 108, 207)('\n         CONNECTION         '));
    bot.login(config.token);
};

function disconnectBotFromOldChannel() {
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
}

process.on('SIGINT', () => {
    // close connections, clear cache, etc
    process.exit(0);
});