'use strict';

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
        this.handlePlay = this.handlePlay.bind(this);
        this.handlePause = this.handlePause.bind(this);
        this.handleVolumeChange = this.handleVolumeChange.bind(this);
    }

    componentDidMount() {
        $('.icon_figure')[0].style.display = 'none';
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
                    dropdown_title: radioName.indexOf('&amp;') !== -1 ? radioName.split('&amp;').join(' & ') : radioName
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

    handleClick(image, url, index, radio) {
        this.setRadioSourceAndInfos(image, url, index, radio, $('audio')[0].volume);
        this.setRadioCookie(true, index, $('audio')[0].volume);
        $('audio')[0].play();
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
            dropdown_title: 'Chargement',
            index: index,
            radioName: radioName
        });
    }

    handleVolumeChange() {
        if ($('audio')[0].paused) {
            this.setRadioCookie(false, this.state.index, $('audio')[0].volume);
        }
        else {
            this.setRadioCookie(true, this.state.index, $('audio')[0].volume);
        }
    }

    handlePause() {
        this.setRadioCookie(false, this.state.index, $('audio')[0].volume);
    }

    handlePlay() {
        this.setState({
            dropdown_title: this.state.radioName.indexOf('&amp;') !== -1 ? this.state.radioName.split('&amp;').join(' & ') : this.state.radioName
        });
        this.setRadioCookie(true, this.state.index, $('audio')[0].volume);
    }

    setRadioCookie(play, radio, volume) {
        const radioCookie = cookies.get('syxbot_doc');
        if (!radioCookie || (radioCookie && (radioCookie.play !== play || radioCookie.radio !== radio || radioCookie.volume !== volume))) {
            cookies.set('syxbot_doc', {
                play: play,
                radio: radio,
                volume: volume
            });
        }
    }

    render() {
        return (
            <nav className='navbar navbar-dark navbar-expand-lg radio-nav'>
                <a className='navbar-brand' href='/'>
                    <img src='/img/Syxbot_logo.png' width='30' height='30' className='d-inline-block align-top' alt='syxbot_logo' />
                    Syxbot
                </a>
                <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon' />
                </button>
                <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                    <ul className='navbar-nav navbar-nav-radio'>
                        <div className='radio_player'>
                            <figure className='icon_figure'>
                                <img src='#' alt='radio_img' />
                            </figure>
                            <figure className='radio_figure'>
                                <audio
                                    controls
                                    autoPlay
                                    onPlay={this.handlePlay}
                                    onPause={this.handlePause}
                                    onVolumeChange={this.handleVolumeChange}
                                />
                                <figcaption>
                                    <div className='dropdown'>
                                        <button type='button' className='radio_select btn btn-secondary dropdown-toggle' id='dropdownMenu2' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                            {this.state.dropdown_title === 'Chargement' ?
                                                <span>{this.state.dropdown_title} <div className='custom-spinner-radio' /></span> :
                                                this.state.dropdown_title}
                                            <FontAwesomeIcon icon='caret-square-down' />
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
                                                        onClick={() => this.handleClick(obj.image, obj.url, index, obj.name)}
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
                    </ul>
                </div>
            </nav>
        );
    }
}