import config from './../../config.json';

export default class Helper {
    constructor(message, words) {
        if (words[1]) {
            this.getCommandInfos(message, words[1].toLowerCase());
        }
        else {
            this.showCommandlist(message);
        }
    }

    static take_user_voiceChannel(message) {
        let voiceChannel = false;
        if (message.guild) {
            message.guild.channels.cache.map(channel => {
                if (channel.type === 'voice') {
                    if (channel.members) {
                        channel.members.map(member => {
                            if (member.user.id === message.author.id) {
                                voiceChannel = channel;
                            }
                        });
                    }
                }
            });
        }
        return voiceChannel;
    }

    static take_user_voiceChannel_by_reaction(message, author) {
        let voiceChannel = false;
        message.guild.channels.cache.map(channel => {
            if (channel.type === 'voice') {
                if (channel.members) {
                    channel.members.map(member => {
                        if (member.user.id === author.id) {
                            voiceChannel = channel;
                        }
                    });
                }
            }
        });
        return voiceChannel;
    }

    // static getBot(message, choice) {
    //     let botMember = false;
    //     message.guild.channels.map(channel => {
    //         if (channel.type === 'voice') {
    //             if (channel.members) {
    //                 channel.members.map(member => {
    //                     if (member.user.bot && member.user.id === config.clientId) {
    //                         if (choice === 'bot') {
    //                             botMember = member;
    //                         }
    //                         else if (choice === 'channel') {
    //                             botMember = channel;
    //                         }
    //                     }
    //                 });
    //             }
    //         }
    //     });
    //     return botMember;
    // }

    static getFirstAuthorizedChannel(guild) {
        if (guild.channels.cache.has(guild.id)) return guild.channels.cache.get(guild.id);

        // Check for a "general" channel
        const generalChannel = guild.channels.cache.find(channel => channel.name === 'general');
        if (generalChannel) return generalChannel;

        // If there is no "general" channel, get the first authorized text channel
        // "guild.client.user" is the bot object
        return guild.channels.cache
            .filter(c => c.type === 'text' &&
                c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
            .first();
    }

    static verifyBotLocation(message, connectedGuild, userChannel, sendMessage = true) {
        if (connectedGuild) {
            if (connectedGuild === userChannel.id) {
                return true;
            }
            else {
                if (sendMessage) {
                    message.channel.send('❌ Vous n\'êtes pas dans le même salon que le bot !');
                }
                return false;
            }
        }
        else {
            if (sendMessage) {
                message.channel.send('❌ Je ne suis pas connecté dans un salon !');
            }
            return false;
        }
    }

    showCommandlist(message) {
        let embedDescription = '';
        this.availableCommand().map(item => {
            embedDescription += item.command + item.exemple;
        });
        message.author.send({
            'embed': {
                'color': 3493780,
                'description': embedDescription,
                'author': {
                    'name': 'Liste des commandes'
                },
                'footer': {
                    'text': 'Veuillez remplacer "+ MAJUSCULE" par votre choix.'
                }
            }
        });
    }

    availableCommand() {
        return [
            {
                name: 'play | p',
                command: '**play | p** + URL/TITRE',
                exemple: '```' + config.prefix + 'p https://www.youtube.com/watch?v=F6E3GkaYdHs``````' + config.prefix + 'play Eminem rap god``` \n',
                infos: [
                    'Rajoute la musique youtube à partir de l\'URL ```' + config.prefix + 'play https://www.youtube.com/watch?v=XbGs_qK2PQA```\n',
                    'Affiche la liste des musiques en file d\'attente ```' + config.prefix + 'p list```\n',
                    'Sélectionne une musique de la file d\'attente et la joue directement ```' + config.prefix + 'play 4``` \n',
                    'Recherche une musique par titre ```' + config.prefix + 'play Eminem rap god``` \n',
                    'Affiche la liste des résultats de toutes les recherches ```' + config.prefix + 'search``` \n',
                    'Affiche la liste des résultats de la recherche de musique ```' + config.prefix + 'search play``` \n',
                    'Sélectionne une musique dans les résultats de la recherche ```' + config.prefix + 'search p 4```\n',
                    'Supprime une/des musique(s) en file d\'attente ```' + config.prefix + 'p remove 15|15-20```'
                ]
            },
            {
                name: 'playlist | pl',
                command: '**playlist | pl** + URL/TITRE',
                exemple: '```' + config.prefix + 'pl https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10``````' + config.prefix + 'playlist anime op``` \n',
                infos: [
                    'Rajoute les musiques de la playlist youtube à partir de l\'URL ```' + config.prefix + 'playlist https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10``` \n',
                    'Affiche la liste des musiques en file d\'attente ```' + config.prefix + 'pl list```\n',
                    'Sélectionne une musique de la file d\'attente et la joue directement ```' + config.prefix + 'playlist 4``` \n',
                    'Recherche une playlist par titre ```' + config.prefix + 'playlist Hip hop``` \n',
                    'Affiche la liste des résultats de toutes les recherches ```' + config.prefix + 'search``` \n',
                    'Affiche la liste des résultats de la recherche de playlist ```' + config.prefix + 'search playlist``` \n',
                    'Sélectionne une playlist dans les résultats de la recherche ```' + config.prefix + 'search pl 4```\n',
                    'Supprime une/des musique(s) en file d\'attente ```' + config.prefix + 'pl remove 15|15-20```'
                ]
            },
            {
                name: 'cancel',
                command: '**cancel**',
                exemple: '```' + config.prefix + 'cancel``` \n',
                infos: [
                    'Annule la recherche par titre```' + config.prefix + 'cancel```'
                ]
            },
            {
                name: 'go',
                command: '**go** + CHOIX',
                exemple: '```' + config.prefix + 'go 15``` \n',
                infos: [
                    'Supprime toutes les musiques avant celle sélectionnée et la joue directement```' + config.prefix + 'go 15```'
                ]
            },
            {
                name: 'repeat',
                command: '**repeat**',
                exemple: '```' + config.prefix + 'repeat``` \n',
                infos: [
                    'Active ou désactive le mode répétition pour la musique en écoute ```' + config.prefix + 'repeat```'
                ]
            },
            {
                name: 'help',
                command: '**help** + COMMANDE',
                exemple: '```' + config.prefix + 'help``````' + config.prefix + 'help pl``` \n',
                infos: [
                    'Affiche la liste de toutes les commandes ```' + config.prefix + 'help```\n',
                    'Affiche les fonctionnalités d\'une commande ```' + config.prefix + 'help pl```'
                ]
            },
            {
                name: 'current | now',
                command: '**current | now**',
                exemple: '```' + config.prefix + 'current``````' + config.prefix + 'now```\n',
                infos: [
                    'Affiche la musique en cours d\'écoute```' + config.prefix + 'current```\n'
                ]
            },
            {
                name: 'next',
                command: '**next**',
                exemple: '```' + config.prefix + 'next``` \n',
                infos: [
                    'Passe à la musique suivante ```' + config.prefix + 'next```'
                ]
            },
            {
                name: 'pause',
                command: '**pause**',
                exemple: '```' + config.prefix + 'pause``` \n',
                infos: [
                    'Met la musique en pause```' + config.prefix + 'pause```'
                ]
            },
            {
                name: 'stop',
                command: '**stop**',
                exemple: '```' + config.prefix + 'stop``` \n',
                infos: [
                    'Arrête la musique et supprime la file d\'attente```' + config.prefix + 'stop```'
                ]
            },
            {
                name: 'resume',
                command: '**resume**',
                exemple: '```' + config.prefix + 'resume``` \n',
                infos: [
                    'Reprend la lecture de la musique ```' + config.prefix + 'resume```'
                ]
            },
            {
                name: 'quit',
                command: '**quit**',
                exemple: '```' + config.prefix + 'quit``` \n',
                infos: [
                    'Déconnecte le bot du salon vocal et supprime la file d\'attente ```' + config.prefix + 'quit```'
                ]
            },
            {
                name: 'remove',
                command: '**remove** + CHOIX',
                exemple: '```' + config.prefix + 'remove 5``` \n',
                infos: [
                    'Supprime le nombre de messages choisit ```' + config.prefix + 'remove 8```'
                ]
            },
            {
                name: 'clear',
                command: '**clear**',
                exemple: '```' + config.prefix + 'clear``` \n',
                infos: [
                    'Supprime tous les messages ```' + config.prefix + 'clear```'
                ]
            },
            {
                name: 'search',
                command: '**search**',
                exemple: '```' + config.prefix + 'search``` \n',
                infos: [
                    'Affiche la liste des résultats d\'une recherche ```' + config.prefix + 'search```\n',
                    'Affiche les musiques dans la liste des résultats d\'une recherche ```' + config.prefix + 'search p```\n',
                    'Sélectionne une musique dans la liste des résultats d\'une recherche ```' + config.prefix + 'search p 3```\n',
                    'Affiche les playlists dans la liste des résultats d\'une recherche ```' + config.prefix + 'search pl```\n',
                    'Sélectionne une playlist dans la liste des résultats d\'une recherche ```' + config.prefix + 'search pl 1```'
                ]
            },
            {
                name: 'radio',
                command: '**radio** + CHOIX',
                exemple: '```' + config.prefix + 'radio nrj``` \n',
                infos: [
                    'Affiche la liste des radios disponibles```' + config.prefix + 'radio list```\n',
                    'Sélectionne une musique de la liste par son nom ```' + config.prefix + 'radio nrj```'
                ]
            },
            {
                name: 'settings | set',
                command: '**settings | set** + CATEGORIE + PARAM + VALEUR',
                exemple: '```' + config.prefix + 'set notif added off``` \n',
                infos: [
                    'Affiche la liste des paramètres disponibles```' + config.prefix + 'settings list```\n',
                    'Exemple de modification d\'un paramètre ```' + config.prefix + 'set notif added off```'
                ]
            }
        ];
    }

    getCommandInfos(message, command) {
        const commandObj = this.availableCommand().filter(c => c.name.split(' | ')[0] === command || c.name.split(' | ')[1] === command);
        if (commandObj && commandObj[0]) {
            let joinedInfos = '';
            commandObj[0].infos.map(info => {
                joinedInfos += info;
            });
            message.author.send({
                'embed': {
                    'color': 3493780,
                    'description': joinedInfos,
                    'author': {
                        'name': commandObj[0].name
                    }
                }
            });
        }
        else {
            message.channel.send('> La commande `' + command + '` n\'existe pas !');
        }

    }
}
