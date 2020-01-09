import React from 'react';
import $ from 'jquery';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretSquareDown } from '@fortawesome/free-solid-svg-icons';
library.add(faCaretSquareDown);

export default class RadioPlayer extends React.Component {
    componentDidMount() {
        $('.icon_figure')[0].style.display = 'none';
        for (let i = 0; i < $('#radio_choices').children().length; i++) {
            $('#radio_choices')[0].children[i].addEventListener('click', (e) => {
                $('.icon_figure')[0].style.display = '';
                const radioImg = document.createElement('img');
                radioImg.src = e.target.getAttribute('image');
                $('.icon_figure')[0].innerHTML = '';
                $('.icon_figure').append(radioImg);
                $('audio')[0].src = e.target.value;
            });
        }
    }

    render() {
        return (
            <div className='radio_player'>
                <figure className='icon_figure'>
                    <img src='/img/nrj.png' alt='radio_img' />
                </figure>
                <figure className='radio_figure'>
                    <audio controls />
                    <figcaption>
                        <div className='dropdown'>
                            <button type='button' className='radio_select btn btn-secondary dropdown-toggle' id='dropdownMenu2' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                Radios disponibles <FontAwesomeIcon icon='caret-square-down' />
                            </button>
                            <div id='radio_choices' className='dropdown-menu' aria-labelledby='dropdownMenu2'>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/40125/aac_64.mp3'
                                    image='/img/nrj.png'
                                >
                                    Nrj
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://listen.radionomy.com/subarashii.mp3'
                                    image='/img/subarashii.png'
                                >
                                    Subarashii
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://belrtl.ice.infomaniak.ch/belrtl-mp3-128.mp3'
                                    image='/img/bel-rtl.png'
                                >
                                    Bel RTL
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://broadcast.infomaniak.ch/radiocontact-mp3-192.mp3'
                                    image='/img/contact.jpg'
                                >
                                    Contact
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streamingp.shoutcast.com/NostalgiePremium-mp3'
                                    image='/img/nostalgie-be.jpg'
                                >
                                    Nostalgie BE
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3?origine=fluxradios'
                                    image='/img/nostalgie-fr.png'
                                >
                                    Nostalgie FR
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/classic21-128.mp3'
                                    image='/img/classic21.jpg'
                                >
                                    Classic 21
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/pure-128.mp3'
                                    image='/img/pure-fm.png'
                                >
                                    Pure FM
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/musiq3-128.mp3'
                                    image='/img/musiq3.jpg'
                                >
                                    Musiq'3
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radios.rtbf.be/vivabxl-128.mp3'
                                    image='/img/vivacite.png'
                                >
                                    VivaCité
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streaming.radio.funradio.fr/fun-1-44-128'
                                    image='/img/fun-radio.png'
                                >
                                    Fun Radio
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=fluxradios'
                                    image='/img/rire&chansons.png'
                                >
                                    Rire & Chansons
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://vr-live-mp3-128.scdn.arkena.com/virginradio.mp3'
                                    image='/img/virgin.png'
                                >
                                    Virgin
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://rfm-live-mp3-128.scdn.arkena.com/rfm.mp3'
                                    image='/img/rfm.png'
                                >
                                    RFM
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://rmc.bfmtv.com/rmcinfo-mp3'
                                    image='/img/rmc.jpg'
                                >
                                    RMC
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://chai5she.cdn.dvmr.fr/bfmbusiness'
                                    image='/img/bfm-business.png'
                                >
                                    BFM Business
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3'
                                    image='/img/jazz.png'
                                >
                                    Jazz
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://cdn.nrjaudio.fm/audio1/fr/30201/mp3_128.mp3?origine=fluxradios'
                                    image='/img/cherie-fm.png'
                                >
                                    Chérie FM
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://mp3lg4.tdf-cdn.com/9240/lag_180945.mp3'
                                    image='/img/europe1.jpg'
                                >
                                    Europe 1
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streaming.radio.rtl.fr/rtl-1-44-128'
                                    image='/img/rtl.jpg'
                                >
                                    RTL
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://streaming.radio.rtl2.fr/rtl2-1-44-128'
                                    image='/img/rtl2.jpg'
                                >
                                    RTL2
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://radioclassique.ice.infomaniak.ch/radioclassique-high.mp3'
                                    image='/img/classique.png'
                                >
                                    Classique
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://www.skyrock.fm/stream.php/tunein16_128mp3.mp3'
                                    image='/img/skyrock.png'
                                >
                                    Skyrock
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.franceinter.fr/live/franceinter-midfi.mp3'
                                    image='/img/france-inter.png'
                                >
                                    France Inter
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.franceculture.fr/live/franceculture-midfi.mp3'
                                    image='/img/france-culture.png'
                                >
                                    France Culture
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.francemusique.fr/live/francemusique-midfi.mp3'
                                    image='/img/france-musique.png'
                                >
                                    France Musique
                                </button>
                                <button
                                    className='dropdown-item'
                                    value='http://direct.francebleu.fr/live/fbpicardie-midfi.mp3'
                                    image='/img/france-bleu.png'
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
