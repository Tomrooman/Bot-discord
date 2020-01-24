import React from 'react';
import $ from 'jquery';
import Cookies from 'universal-cookie';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretSquareDown } from '@fortawesome/free-solid-svg-icons';
library.add(faCaretSquareDown);

const cookies = new Cookies();

export default class RadioPlayer extends React.Component {
    constructor() {
        super();
        this.state = {
            dropdown_title: 'Radios disponibles',
            index: '',
            radioName: '',
            radioCookie: cookies.get('syxbot_doc') || {}
        };
        this.createRadiosArray();
    }

    componentDidMount() {
        $('.icon_figure')[0].style.display = 'none';
        this.setClickHandler();
        this.setPauseHandler();
        this.setPlayHandler();
        this.setVolumeHandler();
        const index = this.state.radioCookie.radio;
        const playArg = this.state.radioCookie.play;
        if (index) {
            const imagePath = $('#radio_choices')[0].children[index].getAttribute('image');
            const radioUrl = $('#radio_choices')[0].children[index].value;
            const radioName = $('#radio_choices')[0].children[index].innerHTML;
            const volume = this.state.radioCookie.volume;
            this.setRadioSourceAndInfos(imagePath, radioUrl, index, radioName, volume);
            if (!playArg) {
                $('audio')[0].removeAttribute('autoPlay');
                this.setState({
                    dropdown_title: radioName
                });
            }
        }
        else {
            $('audio')[0].volume = 0.2;
        }
    }

    createRadiosArray() {
        this.radios = [
            { name: 'Nrj', image: '/img/radio/nrj.png', url: 'http://cdn.nrjaudio.fm/audio1/fr/40125/aac_64.mp3' },
            { name: 'Subarashii', image: '/img/radio/subarashii.png', url: 'http://listen.radionomy.com/subarashii.mp3' },
            { name: 'Bel RTL', image: '/img/radio/bel-rtl.png', url: 'http://belrtl.ice.infomaniak.ch/belrtl-mp3-128.mp3' },
            { name: 'Contact', image: '/img/radio/contact.png', url: 'http://broadcast.infomaniak.ch/radiocontact-mp3-192.mp3' },
            { name: 'Nostalgie BE', image: '/img/radio/nostalgie-be.png', url: 'http://streamingp.shoutcast.com/NostalgiePremium-mp3' },
            { name: 'Nostalgie FR', image: '/img/radio/nostalgie-fr.png', url: 'http://cdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3?origine=fluxradios' },
            { name: 'Classic 21', image: '/img/radio/classic21.png', url: 'http://radios.rtbf.be/classic21-128.mp3' },
            { name: 'Pure FM', image: '/img/radio/pure-fm.png', url: 'http://radios.rtbf.be/pure-128.mp3' },
            { name: 'Musiq\'3', image: '/img/radio/musiq3.png', url: 'http://radios.rtbf.be/musiq3-128.mp3' },
            { name: 'VivaCité', image: '/img/radio/vivacite.png', url: 'http://radios.rtbf.be/vivabxl-128.mp3' },
            { name: 'Fun Radio', image: '/img/radio/fun-radio.png', url: 'http://streaming.radio.funradio.fr/fun-1-44-128' },
            { name: 'Rire & Chansons', image: '/img/radio/rire&chansons.png', url: 'http://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios' },
            { name: 'Virgin', image: '/img/radio/virgin.png', url: 'http://vr-live-mp3-128.scdn.arkena.com/virginradio.mp3' },
            { name: 'RFM', image: '/img/radio/rfm.png', url: 'http://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3' },
            { name: 'RMC', image: '/img/radio/rmc.png', url: 'http://rmc.bfmtv.com/rmcinfo-mp3' },
            { name: 'BFM Business', image: '/img/radio/bfm-business.png', url: 'http://chai5she.cdn.dvmr.fr/bfmbusiness' },
            { name: 'Jazz', image: '/img/radio/jazz.png', url: 'http://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3' },
            { name: 'Chérie FM', image: '/img/radio/cherie-fm.png', url: 'http://cdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios' },
            { name: 'Europe 1', image: '/img/radio/europe1.png', url: 'http://mp3lg4.tdf-cdn.com/9240/lag_180945.mp3' },
            { name: 'RTL', image: '/img/radio/rtl.png', url: 'http://streaming.radio.rtl.fr/rtl-1-44-128' },
            { name: 'RTL2', image: '/img/radio/rtl2.png', url: 'http://streaming.radio.rtl2.fr/rtl2-1-44-128' },
            { name: 'Classique', image: '/img/radio/classique.png', url: 'http://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3' },
            { name: 'Skyrock', image: '/img/radio/skyrock.png', url: 'http://www.skyrock.fm/stream.php/tunein16_128mp3.mp3' },
            { name: 'France Inter', image: '/img/radio/france-inter.png', url: 'http://direct.franceinter.fr/live/franceinter-midfi.mp3' },
            { name: 'France Culture', image: '/img/radio/france-culture.png', url: 'http://direct.franceculture.fr/live/franceculture-midfi.mp3' },
            { name: 'France Musique', image: '/img/radio/france-musique.png', url: 'http://direct.francemusique.fr/live/francemusique-midfi.mp3' },
            { name: 'France Bleu', image: '/img/radio/france-bleu.png', url: 'http://direct.francebleu.fr/live/fbpicardie-midfi.mp3' }
        ];
    }

    setClickHandler() {
        for (let i = 0; i < $('#radio_choices').children().length; i++) {
            $('#radio_choices')[0].children[i].addEventListener('click', (e) => {
                const imagePath = e.target.getAttribute('image');
                const radioUrl = e.target.value;
                const index = e.target.getAttribute('index');
                const radioName = e.target.innerHTML;
                this.setRadioSourceAndInfos(imagePath, radioUrl, index, radioName, $('audio')[0].volume);
                this.setRadioCookie(true, index, $('audio')[0].volume);
            });
        }
    }

    setRadioSourceAndInfos(imagePath, radioUrl, index, radioName, volume) {
        $('.icon_figure')[0].style.display = '';
        $('audio')[0].volume = volume;
        const radioImg = document.createElement('img');
        radioImg.src = imagePath;
        $('.icon_figure')[0].innerHTML = '';
        $('.icon_figure').append(radioImg);
        $('audio')[0].src = radioUrl;
        this.setState({
            dropdown_title: 'Chargement ...',
            index: index,
            radioName: radioName
        });
    }

    setVolumeHandler() {
        $('audio')[0].addEventListener('volumechange', () => {
            if ($('audio')[0].paused) {
                this.setRadioCookie(false, this.state.index, $('audio')[0].volume);
            }
            else {
                this.setRadioCookie(true, this.state.index, $('audio')[0].volume);
            }
        });
    }

    setPauseHandler() {
        $('audio')[0].addEventListener('pause', () => {
            this.setRadioCookie(false, this.state.index, $('audio')[0].volume);
        });
    }

    setPlayHandler() {
        $('audio')[0].addEventListener('play', () => {
            this.setState({
                dropdown_title: this.state.radioName
            });
            this.setRadioCookie(true, this.state.index, $('audio')[0].volume);
        });
    }

    setRadioCookie(play, radio, volume) {
        cookies.set('syxbot_doc', {
            play: play,
            radio: radio,
            volume: volume
        });
    }

    render() {
        return (
            <div className='radio_player'>
                <figure className='icon_figure'>
                    <img src='#' alt='radio_img' />
                </figure>
                <figure className='radio_figure'>
                    <audio controls autoPlay />
                    <figcaption>
                        <div className='dropdown'>
                            <button type='button' className='radio_select btn btn-secondary dropdown-toggle' id='dropdownMenu2' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                {this.state.dropdown_title} <FontAwesomeIcon icon='caret-square-down' />
                            </button>
                            <div id='radio_choices' className='dropdown-menu' aria-labelledby='dropdownMenu2'>
                                {this.radios.map((obj, index) => {
                                    return (
                                        <button
                                            className='dropdown-item'
                                            value={obj.url}
                                            image={obj.image}
                                            index={index}
                                            key={index}
                                        >
                                            {obj.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        );
    }
}
