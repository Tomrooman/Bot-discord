import Helper from './helper.js';
import Player from './player.js';
import Settings from './settings.js';
import config from './../../config.json';
import Discord from 'discord.js';

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
    'Rire&chansons',
    'Virgin',
    'RFM',
    'RMC',
    'BFM-Business',
    'Jazz',
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
];

export default class Radio {
    constructor(message, words) {
        if (words[1]) {
            if (words[1].toLowerCase() === 'list') {
                this.showRadioList(message);
            }
            else if (this.radioExist(words[1].toLowerCase())) {

                this.connectRadio(message, words);
            }
            else {
                message.channel.send('❌ **Cette radio n\'existe pas !** \nTapez **' + config.prefix + 'radio list** pour obtenir la liste des radios disponibles.');
            }
        }
        else {
            message.channel.send('❌ Choisir une radio, c\'est mieux !');
        }
    }

    showRadioList(message) {
        let stringRadioList = '';
        // Create radio list as string and send it
        radioAvailable.map(r => {
            stringRadioList += '> - **' + r + '**\n';
        });
        message.channel.send('> Écrivez le nom de la radio que vous voulez écouter.\n > Ex: ' + config.prefix + 'radio nrj\n > \n ' + stringRadioList);
    }

    radioExist(radioCheck) {
        let checkExist = false;
        // Check radioAbailable array if wanted radio exist
        radioAvailable.map(r => {
            if (r.toLowerCase() === radioCheck) {
                checkExist = true;
            }
        });
        return checkExist;
    }

    getRadioLink(radioForLink) {
        // Return link used for stream the selected radio
        if (radioForLink === 'nrj') {
            return 'https://scdn.nrjaudio.fm/fr/30001/aac_64.mp3?origine=playerweb;playerid:nrj&origine=playernrj&aw_0_req.userConsent=BOvEk5hOvEk5hAKAABENC9-AAAAuFr_7__7-_9_-_f__9uj3Or_v_f__32ccL59v_h_7v-_7fi_20nV4u_1vft9yfk1-5ctDztp507iakiPHmqNeb9n9mz1e5pRP78k89r7337Ew_v8_v-b7BCON_YxE&cdn_path=audio_lbs7';
        }
        else if (radioForLink === 'subarashii') {
            return 'https://listen.radionomy.com/subarashii.mp3';
        }
        else if (radioForLink === 'bel-rtl') {
            return 'https://belrtl.ice.infomaniak.ch/belrtl-mp3-128.mp3';
        }
        else if (radioForLink === 'contact') {
            return 'https://radiocontact.ice.infomaniak.ch/radiocontact-mp3-128.mp3';
        }
        else if (radioForLink === 'nostalgie-be') {
            return 'https://streamingp.shoutcast.com/NostalgiePremium-mp3';
        }
        else if (radioForLink === 'nostalgie-fr') {
            return 'https://scdn.nrjaudio.fm/fr/30601/aac_64.mp3?origine=playerweb;playerid:nostalgie&origine=playernostalgie&aw_0_req.userConsent=BOvHTQ8OvHTQ8AKAABENC--AAAAuhr_7__7-_9_-_f__9uj3Or_v_f__32ccL59v_h_7v-_7fi_20nV4u_1vft9yfk1-5ctDztp507iakiPHmqNeb9n9mz1e5pRP78k89r7337Ew_v8_v-b7BCON_YxEiA&cdn_path=audio_lbs8';
        }
        else if (radioForLink === 'classic21') {
            return 'https://radios.rtbf.be/classic21-128.mp3';
        }
        else if (radioForLink === 'pure-fm') {
            return 'https://radios.rtbf.be/pure-128.mp3';
        }
        else if (radioForLink === 'musiq3') {
            return 'https://radios.rtbf.be/musiq3-128.mp3';
        }
        else if (radioForLink === 'vivacite') {
            return 'https://radios.rtbf.be/vivabxl-128.mp3';
        }
        else if (radioForLink === 'fun-radio') {
            return 'https://icecast.rtl.fr/fun-1-44-128';
        }
        else if (radioForLink === 'rire&chansons') {
            return 'https://scdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios';
        }
        else if (radioForLink === 'virgin') {
            return 'https://ais-live.cloud-services.paris:8443/virgin.aac?aw_0_1st.playerid=lagardereWebVirgin';
        }
        else if (radioForLink === 'rfm') {
            return 'https://ais-live.cloud-services.paris:8443/rfm.aac?aw_0_1st.playerid=lgrdrnwsRadiofrRFM';
        }
        else if (radioForLink === 'rmc') {
            return 'https://rmc.bfmtv.com/rmcinfo-mp3';
        }
        else if (radioForLink === 'bfm-business') {
            return 'https://chai5she.cdn.dvmr.fr/bfmbusiness';
        }
        else if (radioForLink === 'jazz') {
            return 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3';
        }
        else if (radioForLink === 'cherie-fm') {
            return 'https://scdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios';
        }
        else if (radioForLink === 'europe1') {
            return 'https://ais-live.cloud-services.paris:8443/europe1.mp3?aw_0_1st.playerid=lgrdrnwsRadiofrE1';
        }
        else if (radioForLink === 'rtl') {
            return 'https://icecast.rtl.fr/rtl-1-44-128?id=webRTL&aw_0_req.userConsent=BOvHiJgOvHiMPAHABBFRCv-AAAAstrv7__7-_9_-_f__9ujzOr_v_f__30ccL59v_B_zv-_7fi_20jV4u_1vft9yfk1-5ctDztp507iakivXmqdeZ9v_nz3_5phPr8k89r6337EwwAAAAAAAAAAA';
        }
        else if (radioForLink === 'rtl2') {
            return 'https://icecast.rtl.fr/rtl2-1-44-128?listen=webDAQODAkPCwwMAg8EBAIFCQ';
        }
        else if (radioForLink === 'classique') {
            return 'https://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3';
        }
        else if (radioForLink === 'skyrock') {
            return 'https://www.skyrock.fm/stream.php/tunein16_128mp3.mp3';
        }
        else if (radioForLink === 'france-inter') {
            return 'https://direct.franceinter.fr/live/franceinter-midfi.mp3';
        }
        else if (radioForLink === 'france-culture') {
            return 'https://direct.franceculture.fr/live/franceculture-midfi.mp3';
        }
        else if (radioForLink === 'france-musique') {
            return 'https://direct.francemusique.fr/live/francemusique-midfi.mp3';
        }
        else if (radioForLink === 'france-bleu') {
            return 'https://direct.francebleu.fr/live/fbpicardie-midfi.mp3';
        }
    }

    connectRadio(message, words, retry = false) {
        const radioLink = this.getRadioLink(words[1].toLowerCase());
        const voiceChannel = Helper.take_user_voiceChannel(message);
        if (voiceChannel) {
            // Call player setter/getter to save radio infos
            Player.removeArray(message, 'trytonext');
            Player.removeArray(message, 'loop');
            Player.setArray(message, 'radio', true);
            if (!Player.getArray(message, 'connected')) {
                this.joinChannelAndPlayRadio(message, words, voiceChannel, radioLink, retry);
            }
            else if (Helper.verifyBotLocation(message, Player.getArray(message, 'connected'), voiceChannel)) {
                if (!retry) {
                    this.sendRadioEmbed(message, words[1].toLowerCase());
                }
                Player.removeArray(message, 'playlistArray');
                Player.removeArray(message, 'playlistInfos');
                Player.streamDestroy(message);
                const radioStream = Player.getArray(message, 'connections').play(radioLink);
                radioStream.setVolume(0.4);
                Player.setArray(message, 'streams', radioStream);
            }
        }
        else {
            message.channel.send('❌ Vous devez être connecté dans un salon !');
        }
    }

    joinChannelAndPlayRadio(message, words, voiceChannel, radioLink, retry) {
        voiceChannel.join()
            .then(connection => {
                const setting = Settings.get(message.guild.id);
                if (!retry) {
                    this.sendRadioEmbed(message, words[1].toLowerCase());
                }
                Player.setArray(message, 'connections', connection);
                Player.setArray(message, 'connected', voiceChannel.id);
                const radioStream = Player.getArray(message, 'connections').play(radioLink);
                radioStream.setVolume(setting ? setting.audio.volume : 0.4);
                Player.setArray(message, 'streams', radioStream);
            })
            .catch(() => {
                setTimeout(() => {
                    this.connectRadio(message, words, true);
                }, 1500);
            });
    }

    sendRadioEmbed(message, radioTitle) {
        const setting = Settings.get(message.guild.id);
        if (!setting || (setting && setting.notif.radio === 'on')) {
            let radioName = '';
            radioAvailable.map(r => {
                if (r.toLowerCase() === radioTitle) {
                    radioName = r.split('-').join(' ');
                }
            });
            // #543A99 | Mauve
            const color = 5520025;
            const embed = new Discord.MessageEmbed()
                .setAuthor('Radio', 'https://syxbot.com/img/radio_icon.png')
                .setColor(color)
                .setFooter('📻 "' + config.prefix + 'radio list" pour afficher les radios disponibles')
                .setThumbnail(`https://syxbot.com/img/radio/${radioTitle}.png`)
                .addField('Nom de la radio', radioName, true);
            message.channel.send({ embed });
        }
    }
}
