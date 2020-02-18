import Discord from 'discord.js';
import dateFormat from 'dateformat';
import Controller from './lib/js/controller.js';
import Level from './lib/js/level.js';
import Helper from './lib/js/helper.js';
import Player from './lib/js/player.js';
import Settings from './lib/js/settings.js';
import Streams from './lib/js/streams.js';
import config from './config.json';
// import Speech from './lib/js/speech.js';
// const mongoose = require('mongoose');
const bot = new Discord.Client();

// connectToDatabase();
console.log(' ');
console.log('----- ' + dateFormat(Date.now(), 'HH:MM:ss dd/mm/yyyy') + ' -----');

updateSettings();


bot.on('ready', () => {
    disconnectBotFromOldChannel();
    new Streams(bot);
    bot.user.setActivity('!!help | https://syxbot.com/docs', { type: 'PLAYING' })
        .catch(e => console.log('Error while set presence : ', e.message));
    console.log(' - Connected : ' + config.WHAT);
    console.log(' - Connected guilds : ', bot.guilds.size);
});

bot.on('message', (message) => {
    if (message.type === 'GUILD_MEMBER_JOIN' && message.author.id === config.clientId) {
        message.channel.send('🖐 **Salut !** 🖐\n\n🔑 Mon préfix est : `' + config.prefix + '` \n❓ Pour afficher la liste des commandes faites : `' + config.prefix + 'help`');
    }
    else if (message.content.toLowerCase().startsWith(config.prefix) && message.content.indexOf('!!!') === -1) {
        Controller(message, config.prefix, bot);
    }
    else if (message.author.id !== config.clientId) {
        Level.addXp(message);
    }
});

bot.on('messageReactionAdd', (reaction, user) => {
    if (!user.bot) {
        const playlistExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search pl 1') !== -1;
        const videoExist = reaction.message.content.indexOf('Ex: ' + config.prefix + 'search p 2') !== -1;
        if (playlistExist || videoExist) {
            const selection = getSelectionByReaction(reaction);
            if (playlistExist && !videoExist) {
                if (reaction.emoji.name === '⏩') {
                    nextReaction(reaction, user, 'playlist');
                }
                else {
                    new Player().selectSongInSearchList(reaction.message, selection, 'playlist', [true, user]);
                }
            }
            else if (videoExist && !playlistExist) {
                if (reaction.emoji.name === '⏩') {
                    nextReaction(reaction, user, 'video');
                }
                else {
                    new Player().selectSongInSearchList(reaction.message, selection, 'musique', [true, user]);
                }
            }
        }
    }
});

function nextReaction(reaction, user, type) {
    const userChannel = Helper.take_user_voiceChannel_by_reaction(reaction.message, user);
    if (userChannel) {
        new Player().youtubeResearch(reaction.message, null, type, false, [true, user]);
    }
    else {
        reaction.message.channel.send('❌ Vous devez être connecté dans un salon !');
    }
}

function getSelectionByReaction(reaction) {
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
}

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
//         bot.login(config.token);
//     });
// }

// bot.on('voiceStateUpdate', (oldMember, newMember) => {
//     const newUserChannel = newMember.channelID;
//     const oldUserChannel = oldMember.channelID;
//     if (!oldUserChannel && newUserChannel) {
//         // User Joins a voice channel
//         console.log('Joined channel ! : ', newMember);
//         if (checkBot(newMember)) {
//             console.log('Joined channel with bot in there');
//         }
//     }
//     else if (oldUserChannel && !newUserChannel) {
//         // User disconnect a voice channel
//         console.log('Disconnect channel !');
//     }
//     else if (oldUserChannel !== newUserChannel) {
//         // User change channel
//         console.log('User change channel');
//         if (checkBot(newMember)) {
//         }
//     }
// });

// function checkBot(memberParam) {
//     let pass = false;
//     memberParam.channel.members.map(member => {
//         console.log('member : ', member.user.bot);
//         console.log('member id : ', member.id);
//         if (member.user.bot && member.id === config.clientId) {
//             console.log('syxbot in the channel');
//             pass = true;
//         }
//     });
//     return pass;
// }

// bot.on('guildMemberSpeaking', (user, speaking) => {
//     if (speaking) {
//         console.log('Speaking');
//         new Speech(user, bot);
//     }
//     else {
//         return console.log('not speaking');
//     }
// });

function updateSettings() {
    Settings.update()
        .then(res => {
            if (res) {
                console.log('Connecting syxbot ...');
                bot.login(config.token);
            }
            else {
                setTimeout(() => {
                    updateSettings();
                }, 1000);
            }
        })
        .catch((e) => {
            console.log('Index error while update settings : ', e.message);
            updateSettings();
        });
}

function disconnectBotFromOldChannel() {
    console.log('Disconnecting from all channels ...');
    console.log('GUILD : ', bot.guilds);
    bot.guilds.map(g => {
        g.channels.map(channel => {
            if (channel.type === 'voice') {
                if (channel.members) {
                    channel.members.map(member => {
                        if (member.user.bot && member.user.id === config.clientId) {
                            channel.join()
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