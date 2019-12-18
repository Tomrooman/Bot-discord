const Helper = require('./helper.js')
const Player = require('./player.js')
const config = require('./../../config.json')
const Discord = require('discord.js')

const radioAvailable = [
    'NRJ',
    'Subarashii',
    'Bel-RTL',
    'Contact',
    'Nostalgie-BE',
    'Nostalgie-FR',
    'Classic21',
    'Pure-FM',
    'Musiq3',
    'VivaCite',
    'Fun-radio',
    'Rire&chanson',
    'Virgin',
    'RFM',
    'RMC',
    'BFM-Business',
    'jazz',
    'Cherie-FM',
    'Europe1',
    'RTL',
    'RTL2',
    'Classique',
    'Skyrock',
    'France-Inter',
    'France-Culture',
    'France-Musique',
    'France-Bleu'
]

class Radio {

    constructor(message, words) {
        if (words[1]) {
            if (words[1].toLowerCase() === 'list') {
                this.showRadioList(message)
            }
            else if (this.radioExist(words[1].toLowerCase())) {

                this.connectRadio(message, words)
            }
            else {
                message.channel.send('> **Cette radio n\'existe pas !** \n > Tapez **' + config.prefix + 'radio list** pour obtenir la liste des radios disponibles.')
            }
        }
        else {
            message.channel.send('> Choisir une radio, c\'est mieux !')
        }
    }

    showRadioList(message) {
        let stringRadioList = ''
        // Create radio list as string and send it
        radioAvailable.map(r => {
            stringRadioList += '> - **' + r + '**\n'
        })
        message.channel.send('> Écrivez le nom de la radio que vous voulez écouter.\n > Ex: ' + config.prefix + 'radio nrj\n > \n ' + stringRadioList)
    }

    radioExist(radioCheck) {
        let checkExist = false
        // Check radioAbailable array if wanted radio exist
        radioAvailable.map(r => {
            if (r.toLowerCase() === radioCheck) {
                checkExist = true
            }
        })
        return checkExist
    }

    getRadioLink(radioForLink) {
        // Return link used for stream the selected radio
        if (radioForLink === 'nrj') {
            return 'http://cdn.nrjaudio.fm/audio1/fr/40125/aac_64.mp3'
        }
        else if (radioForLink === 'subarashii') {
            return 'http://listen.radionomy.com/subarashii.mp3'
        }
        else if (radioForLink === 'bel-rtl') {
            return 'http://belrtl.ice.infomaniak.ch/belrtl-mp3-128.mp3'
        }
        else if (radioForLink === 'contact') {
            return 'http://broadcast.infomaniak.ch/radiocontact-mp3-192.mp3'
        }
        else if (radioForLink === 'nostalgie-be') {
            return 'http://streamingp.shoutcast.com/NostalgiePremium-mp3'
        }
        else if (radioForLink === 'nostalgie-fr') {
            return 'http://cdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3?origine=fluxradios'
        }
        else if (radioForLink === 'classic21') {
            return 'http://radios.rtbf.be/classic21-128.mp3'
        }
        else if (radioForLink === 'pure-fm') {
            return 'http://radios.rtbf.be/pure-128.mp3'
        }
        else if (radioForLink === 'musiq3') {
            return 'http://radios.rtbf.be/musiq3-128.mp3'
        }
        else if (radioForLink === 'vivacite') {
            return 'http://radios.rtbf.be/vivabxl-128.mp3'
        }
        else if (radioForLink === 'fun-radio') {
            return 'http://streaming.radio.funradio.fr/fun-1-44-128'
        }
        else if (radioForLink === 'rire&chanson') {
            return 'http://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios'
        }
        else if (radioForLink === 'virgin') {
            return 'http://vr-live-mp3-128.scdn.arkena.com/virginradio.mp3'
        }
        else if (radioForLink === 'rfm') {
            return 'http://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3'
        }
        else if (radioForLink === 'rmc') {
            return 'http://rmc.bfmtv.com/rmcinfo-mp3'
        }
        else if (radioForLink === 'bfm-business') {
            return 'http://chai5she.cdn.dvmr.fr/bfmbusiness'
        }
        else if (radioForLink === 'jazz') {
            return 'http://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3'
        }
        else if (radioForLink === 'cherie-fm') {
            return 'http://cdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios'
        }
        else if (radioForLink === 'europe1') {
            return 'http://mp3lg4.tdf-cdn.com/9240/lag_180945.mp3'
        }
        else if (radioForLink === 'rtl') {
            return 'http://streaming.radio.rtl.fr/rtl-1-44-128'
        }
        else if (radioForLink === 'rtl2') {
            return 'http://streaming.radio.rtl2.fr/rtl2-1-44-128'
        }
        else if (radioForLink === 'classique') {
            return 'http://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3'
        }
        else if (radioForLink === 'skyrock') {
            return 'http://www.skyrock.fm/stream.php/tunein16_128mp3.mp3'
        }
        else if (radioForLink === 'france-inter') {
            return 'http://direct.franceinter.fr/live/franceinter-midfi.mp3'
        }
        else if (radioForLink === 'france-culture') {
            return 'http://direct.franceculture.fr/live/franceculture-midfi.mp3'
        }
        else if (radioForLink === 'france-musique') {
            return 'http://direct.francemusique.fr/live/francemusique-midfi.mp3'
        }
        else if (radioForLink === 'france-bleu') {
            return 'http://direct.francebleu.fr/live/fbpicardie-midfi.mp3'
        }
    }

    connectRadio(message, words) {
        const radioLink = this.getRadioLink(words[1].toLowerCase())
        const voiceChannel = Helper.take_user_voiceChannel(message)
        if (voiceChannel) {
            // Call player setter/getter to save radio infos
            Player.removeArray(message, 'trytonext')
            Player.removeArray(message, 'loop')
            Player.setArray(message, 'radio', true)
            if (!Player.getArray(message, 'connected')) {
                voiceChannel.join()
                    .then(connection => {
                        this.sendRadioEmbed(message, words[1].toLowerCase())
                        Player.setArray(message, 'connections', connection)
                        Player.setArray(message, 'connected', voiceChannel.id)
                        Player.setArray(message, 'streams', Player.getArray(message, 'connections').play(radioLink).setVolume(0.4))
                    })
            }
            else if (Helper.verifyBotLocation(message, Player.getArray(message, 'connected'), voiceChannel)) {
                this.sendRadioEmbed(message, words[1].toLowerCase())
                Player.removeArray(message, 'playlistArray')
                Player.removeArray(message, 'playlistInfos')
                Player.streamDestroy(message)
                Player.setArray(message, 'streams', Player.getArray(message, 'connections').play(radioLink).setVolume(0.4))
            }
        }
        else {
            message.channel.send('> Vous devez être connecté dans un salon !')
        }
    }

    sendRadioEmbed(message, radioTitle) {
        // #543A99 | Mauve
        const color = 5520025
        const embed = new Discord.MessageEmbed()
            .setAuthor('Radio', 'https://syxbot.com/img/radio_icon.png')
            .setColor(color)
            .setFooter('"' + config.prefix + 'radio list" pour afficher les radios disponibles')
            .addField('Nom de la radio', radioTitle, true)
        message.channel.send({ embed });
    }

}

module.exports = Radio