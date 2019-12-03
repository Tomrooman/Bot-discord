const Player = require('./player.js')
const config = require('./../../config.json')

function take_user_voiceChannel(message) {
    let voiceChannel = false
    message.guild.channels.map(channel => {
        if (channel.type === 'voice') {
            if (channel.members) {
                channel.members.map(member => {
                    if (member.user.id === message.author.id) {
                        voiceChannel = channel
                    }
                })
            }
        }
    })
    return voiceChannel
}

function getFirstAuthorizedChannel(guild) {
    if (guild.channels.has(guild.id)) return guild.channels.get(guild.id)

    // Check for a "general" channel
    const generalChannel = guild.channels.find(channel => channel.name === 'general');
    if (generalChannel) return generalChannel;

    // If there is no "general" channel, get the first authorized text channel
    // "guild.client.user" is the bot object
    return guild.channels
        .filter(c => c.type === 'text' &&
            c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
        .first();
}

function verifyBotLocation(message, userChannel) {
    const locationInfos = Player.getVerifyBotLocationInfos(userChannel.id, message.guild.id)
    if (locationInfos[0] && locationInfos[1] === userChannel.id) {
        return true
    }
    else if (!locationInfos[1]) {
        message.channel.send('Je ne suis pas connecté dans un salon !')
        return false
    }
    else {
        message.channel.send('Vous n\'êtes pas dans le même salon que le bot !')
        return false
    }
}

function showCommandlist(message) {
    let embedDescription = ''
    availableCommand().map(item => {
        embedDescription += item.command + item.exemple
    })
    message.channel.send({
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
    })
}

function availableCommand() {
    return [
        {
            name: 'play',
            showName: 'play',
            command: '**play** + URL/TITRE',
            exemple: '```' + config.prefix + 'play https://www.youtube.com/watch?v=F6E3GkaYdHs``````' + config.prefix + 'play Eminem rap god``` \n',
            infos: [
                'Rajoute la musique youtube à partir de l\'URL ```' + config.prefix + 'play URL``````Ex: ' + config.prefix + 'play https://www.youtube.com/watch?v=XbGs_qK2PQA```\n',
                'Affiche la liste des musiques en file d\'attente ```' + config.prefix + 'play list```\n',
                'Sélectionne une musique dans la file d\'attente ```' + config.prefix + 'p CHOIX``````Ex: ' + config.prefix + 'play 4``` \n',
                'Recherche une musique par titre ```' + config.prefix + 'play TITRE``````Ex: ' + config.prefix + 'play Eminem rap god``` \n',
                'Affiche la liste des résultats des recherches ```' + config.prefix + 'search``` \n',
                'Sélectionne une musique dans les résultats de la recherche ```' + config.prefix + 'search play CHOIX``````Ex: ' + config.prefix + 'search play 4```'
            ]
        },
        {
            name: 'p',
            showName: 'p (raccourci de la commande play)',
            command: '**p** + URL/TITRE',
            exemple: '```' + config.prefix + 'p https://www.youtube.com/watch?v=F6E3GkaYdHs``````' + config.prefix + 'p Eminem rap god``` \n',
            infos: [
                'Rajoute la musique youtube à partir de l\'URL ```' + config.prefix + 'p URL``````Ex: ' + config.prefix + 'p https://www.youtube.com/watch?v=XbGs_qK2PQA``` \n',
                'Affiche la liste des musiques en file d\'attente ```' + config.prefix + 'p list```\n',
                'Sélectionne une musique dans la file d\'attente ```' + config.prefix + 'p CHOIX``````Ex: ' + config.prefix + 'p 4``` \n',
                'Recherche une musique par titre ```' + config.prefix + 'p TITRE``````Ex: ' + config.prefix + 'p Eminem rap god``` \n',
                'Affiche la liste des résultats des recherches ```' + config.prefix + 'search``` \n',
                'Sélectionne une musique dans les résultats de la recherche ```' + config.prefix + 'search p CHOIX``````Ex: ' + config.prefix + 'search p 4```'
            ]
        },
        {
            name: 'playlist',
            showName: 'playlist',
            command: '**playlist** + URL',
            exemple: '```' + config.prefix + 'playlist https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10``` \n',
            infos: [
                'Rajoute les musiques de la playlist youtube à partir de l\'URL ```' + config.prefix + 'playlist URL``````Ex: ' + config.prefix + 'playlist https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10``` \n',
                'Affiche la liste des musiques en file d\'attente ```' + config.prefix + 'playlist list```\n',
                'Sélectionne une musique dans la file d\'attente ```' + config.prefix + 'playlist CHOIX``````Ex: ' + config.prefix + 'playlist 4``` \n',
                'Recherche une playlist par titre ```' + config.prefix + 'playlist TITRE``````Ex: ' + config.prefix + 'playlist Hip hop``` \n',
                'Affiche la liste des résultats des recherches ```' + config.prefix + 'search``` \n',
                'Sélectionne une playlist dans les résultats de la recherche ```' + config.prefix + 'search playlist CHOIX``````Ex: ' + config.prefix + 'search playlist 4```'
            ]
        },
        {
            name: 'pl',
            showName: 'pl (raccourci de la commande playlist)',
            command: '**pl** + URL',
            exemple: '```' + config.prefix + 'pl https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10``` \n',
            infos: [
                'Rajoute les musiques de la playlist youtube à partir de l\'URL ```' + config.prefix + 'pl URL``````Ex: ' + config.prefix + 'pl https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10``` \n',
                'Affiche la liste des musiques en file d\'attente ```' + config.prefix + 'pl list```\n',
                'Sélectionne une musique dans la file d\'attente ```' + config.prefix + 'pl CHOIX``````Ex: ' + config.prefix + 'pl 4``` \n',
                'Recherche une playlist par titre ```' + config.prefix + 'pl TITRE``````Ex: ' + config.prefix + 'pl Hip hop``` \n',
                'Affiche la liste des résultats des recherches ```' + config.prefix + 'search``` \n',
                'Sélectionne une playlist dans les résultats de la recherche ```' + config.prefix + 'search pl CHOIX``````Ex: ' + config.prefix + 'search pl 4```'
            ]
        },
        {
            name: 'loop',
            showName: 'loop',
            command: '**loop**',
            exemple: '```' + config.prefix + 'loop``` \n',
            infos: [
                'Active ou désactive le mode répétition pour la musique en écoute ```' + config.prefix + 'loop```'
            ]
        },
        {
            name: 'help',
            showName: 'help',
            command: '**help** + COMMANDE',
            exemple: '```' + config.prefix + 'help``````' + config.prefix + 'help pl``` \n',
            infos: [
                'Affiche la liste de toutes les commandes ```' + config.prefix + 'help```\n',
                'Affiche les fonctionnalités d\'une commande ```' + config.prefix + 'help CHOIX``````Ex: ' + config.prefix + 'help pl```'
            ]
        },
        {
            name: 'next',
            showName: 'next',
            command: '**next**',
            exemple: '```' + config.prefix + 'next``` \n',
            infos: [
                'Passe à la musique suivante ```' + config.prefix + 'next```'
            ]
        },
        {
            name: 'pause',
            showName: 'pause',
            command: '**pause**',
            exemple: '```' + config.prefix + 'pause``` \n',
            infos: [
                'Met la musique en pause```' + config.prefix + 'pause```'
            ]
        },
        {
            name: 'resume',
            showName: 'resume',
            command: '**resume**',
            exemple: '```' + config.prefix + 'resume``` \n',
            infos: [
                'Reprend la lecture de la musique ```' + config.prefix + 'resume```'
            ]
        },
        {
            name: 'quit',
            showName: 'quit',
            command: '**quit**',
            exemple: '```' + config.prefix + 'quit``` \n',
            infos: [
                'Déconnecte le bot du salon vocal ```' + config.prefix + 'quit```'
            ]
        },
        {
            name: 'remove',
            showName: 'remove',
            command: '**remove** + CHOIX',
            exemple: '```' + config.prefix + 'remove 5``` \n',
            infos: [
                'Supprime le nombre de messages choisit ```' + config.prefix + 'remove CHOIX``````Ex: ' + config.prefix + 'remove 8```'
            ]
        },
        {
            name: 'clear',
            showName: 'clear',
            command: '**clear**',
            exemple: '```' + config.prefix + 'clear``` \n',
            infos: [
                'Supprime tous les messages ```' + config.prefix + 'clear```'
            ]
        },
        {
            name: 'search',
            showName: 'search',
            command: '**search**',
            exemple: '```' + config.prefix + 'search``` \n',
            infos: [
                'Affiche la liste des résultats d\'une recherche ```' + config.prefix + 'search```\n',
                'Sélectionne une musique dans la liste des résultats d\'une recherche ```' + config.prefix + 'search CHOIX``````Ex: ' + config.prefix + 'search 3```'
            ]
        },
        {
            name: 'radio',
            showName: 'radio',
            command: '**radio** + CHOIX',
            exemple: '```' + config.prefix + 'radio nrj``` \n',
            infos: [
                'Affiche la liste des radios disponibles```' + config.prefix + 'radio list```\n',
                'Sélectionne une musique de la liste par son nom ```' + config.prefix + 'radio NOM``````Ex: ' + config.prefix + 'radio nrj```'
            ]
        }
    ]
}

function getCommandInfos(message, command) {
    const commandObj = availableCommand().filter(c => c.name === command)
    let joinedInfos = ''
    commandObj[0].infos.map(info => {
        joinedInfos += info
    })
    message.channel.send({
        'embed': {
            'color': 3493780,
            'description': joinedInfos,
            'author': {
                'name': commandObj[0].showName
            }
        }
    })
}

exports.take_user_voiceChannel = take_user_voiceChannel
exports.getFirstAuthorizedChannel = getFirstAuthorizedChannel
exports.verifyBotLocation = verifyBotLocation
exports.showCommandlist = showCommandlist
exports.availableCommand = availableCommand
exports.getCommandInfos = getCommandInfos