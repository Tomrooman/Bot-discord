import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretSquareDown } from '@fortawesome/free-solid-svg-icons';
library.add(faCaretSquareDown);

export default class RadioPlayer extends React.Component {
    constructor() {
        super();
        this.state = {
            dropdown_title: 'Radios disponibles',
            index: '',
            radioName: ''
        };
    }

    componentDidMount() {
        $('.icon_figure')[0].style.display = 'none';
        for (let i = 0; i < $('#radio_choices').children().length; i++) {
            $('#radio_choices')[0].children[i].addEventListener('click', (e) => {
                const imagePath = e.target.getAttribute('image');
                const radioUrl = e.target.value;
                const index = e.target.getAttribute('index');
                const radioName = e.target.innerHTML;
                this.props.setRadioArgs('?radio=' + index + '&play=true&volume=' + $('audio')[0].volume);
                this.setRadioSourceAndInfos(imagePath, radioUrl, index, radioName, $('audio')[0].volume);
            });
        }
        this.setPauseHandler();
        this.setPlayHandler();
        this.setVolumeHandler();
        const parsedUrl = new URL(window.location.href);
        const index = parsedUrl.searchParams.get('radio');
        const playArg = parsedUrl.searchParams.get('play');
        if (index && playArg) {
            const imagePath = $('#radio_choices')[0].children[index].getAttribute('image');
            const radioUrl = $('#radio_choices')[0].children[index].value;
            const radioName = $('#radio_choices')[0].children[index].innerHTML;
            const volume = parsedUrl.searchParams.get('volume') || 0;
            this.setRadioSourceAndInfos(imagePath, radioUrl, index, radioName, volume);
            this.props.setRadioArgs('?radio=' + index + '&play=true&volume=' + volume);
            if (playArg === 'false') {
                $('audio')[0].removeAttribute('autoPlay');
                this.setState({
                    dropdown_title: radioName
                });
            }
        }
    }

    setRadioSourceAndInfos(imagePath, radioUrl, index, radioName, volume) {
        $('.icon_figure')[0].style.display = '';
        $('audio')[0].volume = volume === 0 ? 0.2 : volume;
        const radioImg = document.createElement('img');
        radioImg.src = imagePath;
        $('.icon_figure')[0].innerHTML = '';
        $('.icon_figure').append(radioImg);
        $('audio')[0].src = radioUrl;
        this.setState({
            dropdown_title: 'Chargement ...',
            index: index,
            radioName: radioName,
            volume: volume
        });
    }

    setVolumeHandler() {
        $('audio')[0].addEventListener('volumechange', () => {
            if ($('audio')[0].paused) {
                this.props.setRadioArgs('?radio=' + this.state.index + '&play=false&volume=' + $('audio')[0].volume);
            }
            else {
                this.props.setRadioArgs('?radio=' + this.state.index + '&play=true&volume=' + $('audio')[0].volume);
            }
        });
    }

    setPauseHandler() {
        $('audio')[0].addEventListener('pause', () => {
            this.props.setRadioArgs('?radio=' + this.state.index + '&play=false&volume=' + $('audio')[0].volume);
        });
    }

    setPlayHandler() {
        $('audio')[0].addEventListener('play', () => {
            this.setState({
                dropdown_title: this.state.radioName
            });
            this.props.setRadioArgs('?radio=' + this.state.index + '&play=true&volume=' + $('audio')[0].volume);
        });
    }

    render() {
        return (
            <div className='radio_player'>
                <figure className='icon_figure'>
                    <img src='/img/nrj.png' alt='radio_img' />
                </figure>
                <figure className='radio_figure'>
                    <audio controls autoPlay />
                    <figcaption>
                        <div className='dropdown'>
                            <button type='button' className='radio_select btn btn-secondary dropdown-toggle' id='dropdownMenu2' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                {this.state.dropdown_title} <FontAwesomeIcon icon='caret-square-down' />
                            </button>
                            <div id='radio_choices' className='dropdown-menu' aria-labelledby='dropdownMenu2'>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/40125/aac_64.mp3'
                                    image='/img/nrj.png'
                                    index='0'
                                >
                                    Nrj
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://listen.radionomy.com/subarashii.mp3'
                                    image='/img/subarashii.png'
                                    index='1'
                                >
                                    Subarashii
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://belrtl.ice.infomaniak.ch/belrtl-mp3-128.mp3'
                                    image='/img/bel-rtl.png'
                                    index='2'
                                >
                                    Bel RTL
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://broadcast.infomaniak.ch/radiocontact-mp3-192.mp3'
                                    image='/img/contact.jpg'
                                    index='3'
                                >
                                    Contact
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streamingp.shoutcast.com/NostalgiePremium-mp3'
                                    image='/img/nostalgie-be.jpg'
                                    index='4'
                                >
                                    Nostalgie BE
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3?origine=fluxradios'
                                    image='/img/nostalgie-fr.png'
                                    index='5'
                                >
                                    Nostalgie FR
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/classic21-128.mp3'
                                    image='/img/classic21.jpg'
                                    index='6'
                                >
                                    Classic 21
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/pure-128.mp3'
                                    image='/img/pure-fm.png'
                                    index='7'
                                >
                                    Pure FM
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/musiq3-128.mp3'
                                    image='/img/musiq3.jpg'
                                    index='8'
                                >
                                    Musiq'3
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/vivabxl-128.mp3'
                                    image='/img/vivacite.png'
                                    index='9'
                                >
                                    VivaCité
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streaming.radio.funradio.fr/fun-1-44-128'
                                    image='/img/fun-radio.png'
                                    index='10'
                                >
                                    Fun Radio
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios'
                                    image='/img/rire&chansons.png'
                                    index='11'
                                >
                                    Rire & Chansons
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://vr-live-mp3-128.scdn.arkena.com/virginradio.mp3'
                                    image='/img/virgin.png'
                                    index='12'
                                >
                                    Virgin
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3'
                                    image='/img/rfm.png'
                                    index='13'
                                >
                                    RFM
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://rmc.bfmtv.com/rmcinfo-mp3'
                                    image='/img/rmc.jpg'
                                    index='14'
                                >
                                    RMC
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://chai5she.cdn.dvmr.fr/bfmbusiness'
                                    image='/img/bfm-business.png'
                                    index='15'
                                >
                                    BFM Business
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3'
                                    image='/img/jazz.png'
                                    index='16'
                                >
                                    Jazz
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios'
                                    image='/img/cherie-fm.png'
                                    index='17'
                                >
                                    Chérie FM
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://mp3lg4.tdf-cdn.com/9240/lag_180945.mp3'
                                    image='/img/europe1.jpg'
                                    index='18'
                                >
                                    Europe 1
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streaming.radio.rtl.fr/rtl-1-44-128'
                                    image='/img/rtl.jpg'
                                    index='19'
                                >
                                    RTL
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streaming.radio.rtl2.fr/rtl2-1-44-128'
                                    image='/img/rtl2.jpg'
                                    index='20'
                                >
                                    RTL2
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3'
                                    image='/img/classique.png'
                                    index='21'
                                >
                                    Classique
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://www.skyrock.fm/stream.php/tunein16_128mp3.mp3'
                                    image='/img/skyrock.png'
                                    index='22'
                                >
                                    Skyrock
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.franceinter.fr/live/franceinter-midfi.mp3'
                                    image='/img/france-inter.png'
                                    index='23'
                                >
                                    France Inter
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.franceculture.fr/live/franceculture-midfi.mp3'
                                    image='/img/france-culture.png'
                                    index='24'
                                >
                                    France Culture
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.francemusique.fr/live/francemusique-midfi.mp3'
                                    image='/img/france-musique.png'
                                    index='25'
                                >
                                    France Musique
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.francebleu.fr/live/fbpicardie-midfi.mp3'
                                    image='/img/france-bleu.png'
                                    index='26'
                                >
                                    France Bleu
                                </button>
                            </div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        );
    }
}

RadioPlayer.propTypes = {
    setRadioArgs: PropTypes.func.isRequired
};
