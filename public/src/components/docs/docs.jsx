"use strict";

import React from 'react';
import PropTypes from "prop-types";
import Play from './play/play.jsx';
import Sidebar from './sidebar/sidebar.jsx';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faListUl, faHome, faPenFancy, faPause, faListOl, faHeadphonesAlt, faWindowClose, faQuestion, faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';
import { faStepForward, faTrashAlt, faRss, faPlay, faSyncAlt, faEraser, faSignOutAlt, faSearch, faForward, faArrowCircleUp, faCheck } from '@fortawesome/free-solid-svg-icons';
library.add(faBookmark);
library.add(faListUl);
library.add(faHome);
library.add(faPenFancy);
library.add(faPause);
library.add(faListOl);
library.add(faHeadphonesAlt);
library.add(faWindowClose);
library.add(faQuestion);
library.add(faStepForward);
library.add(faTrashAlt);
library.add(faRss);
library.add(faPlay);
library.add(faSyncAlt);
library.add(faEraser);
library.add(faSignOutAlt);
library.add(faSearch);
library.add(faForward);
library.add(faArrowCircleDown);
library.add(faArrowCircleUp);
library.add(faCheck);

import './docs.css';

export default class Docs extends React.Component {

    constructor(props) {
        super()
        let page = null
        if (props.command === 'play') {
            page = <Play />
        }
        this.state = {
            command: props.command,
            page: page
        }
    }

    componentDidMount() {
        setTimeout(() => {
            $('.syx_container h1').addClass('load')
            $('.top_logo').addClass('load')
            if ($('.docs_panel')) {
                setTimeout(() => {
                    $('.docs_panel').addClass('load')
                    if ($('.div_docs_content_command')) {
                        setTimeout(() => {
                            $('.div_docs_content_command').addClass('load')
                        }, 200)
                    }
                }, 200)
            }
        }, 200)
    }

    handleMouseEnter(command) {
        $('#command_list a')[command].style.color = 'rgb(93, 67, 126)'
        $('#command_list a')[command].style.letterSpacing = '5px'
        $('#command_list a')[command].style.background = '#f0f0f0'
        $('#command_list a')[command].style.borderLeft = '5px solid rgba(93, 67, 126, 0.74)'
        $('#command_list a')[command].style.boxShadow = '-5px 0px 4px rgb(93, 67, 126, 1)'
    }

    handleMouseLeave(command) {
        $('#command_list a')[command].style.color = ''
        $('#command_list a')[command].style.background = ''
        $('#command_list a')[command].style.borderLeft = ''
        $('#command_list a')[command].style.boxShadow = ''
        $('#command_list a')[command].style.letterSpacing = ''
    }

    handleMouseEnterContactBtn() {
        $('.components')[0].children[1].children[0].style.color = 'rgb(93, 67, 126)'
        $('.components')[0].children[1].style.letterSpacing = '5px'
        $('.components')[0].children[1].style.background = '#f0f0f0'
        $('.components')[0].children[1].children[0].style.borderLeft = '5px solid rgba(93, 67, 126, 0.74)'
        $('.components')[0].children[1].style.boxShadow = '-5px 0px 4px rgb(93, 67, 126, 1)'
    }

    handleMouseLeaveContactBtn() {
        $('.components')[0].children[1].children[0].style.color = ''
        $('.components')[0].children[1].style.letterSpacing = ''
        $('.components')[0].children[1].style.background = ''
        $('.components')[0].children[1].children[0].style.borderLeft = ''
        $('.components')[0].children[1].style.boxShadow = ''
    }

    render() {
        return (
            <div className='wrapper'>
                <Sidebar command={this.state.command} />
                <div id="content" className="content">
                    {this.state.page ?
                        this.state.page :
                        <div className="syx_container">
                            <h1><FontAwesomeIcon icon="home" />
                                Accueil
                            </h1>
                            <div className="top_logo"><img src="/img/Syxbot_logo.png"></img></div>
                            <div className="docs_content">
                                <div className="docs_panel">
                                    <p className="h5">Bienvenue sur la docs de syxbot</p>
                                    <p>N'hésitez pas à me contacter pour toute(s) question(s), idée(s) de modification(s), etc ...</p>
                                    <a href="/docs/contact">
                                        <button
                                            className="contact-btn"
                                            onMouseEnter={() => { this.handleMouseEnterContactBtn() }}
                                            onMouseLeave={() => { this.handleMouseLeaveContactBtn() }}>
                                            Me contacter
                                    </button>
                                    </a>
                                </div>
                                <div className="div_docs_content_command">
                                    <h4><FontAwesomeIcon icon="check" /> Les commandes disponibles</h4>
                                    <a
                                        href="/docs/play"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(0)}
                                        onMouseLeave={() => this.handleMouseLeave(0)}>
                                        <h5><FontAwesomeIcon icon="headphones-alt" />Play</h5>
                                        <div className="command_desc">
                                            <p>Rajoute une musique avec l'URL, sélectionne une musique, recherche d'une musique par titre, ...</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/playlist"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(1)}
                                        onMouseLeave={() => this.handleMouseLeave(1)}>
                                        <h5><FontAwesomeIcon icon="list-ol" />Playlist</h5>
                                        <div className="command_desc">
                                            <p>Rajoute une playlist avec l'URL, sélectionne une musique, recherche d'une playlist par titre, ...</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/cancel"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(2)}
                                        onMouseLeave={() => this.handleMouseLeave(2)}>
                                        <h5><FontAwesomeIcon icon="window-close" />Cancel</h5>
                                        <div className="command_desc">
                                            <p>Annule une recherche de musique ou playlist dans le cas où il ne trouverait pas de résultats.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/go"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(3)}
                                        onMouseLeave={() => this.handleMouseLeave(3)}>
                                        <h5><FontAwesomeIcon icon="forward" />Go</h5>
                                        <div className="command_desc">
                                            <p>Passe directement à la musique de la file d'attente sélectionnée.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/repeat"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(4)}
                                        onMouseLeave={() => this.handleMouseLeave(4)}>
                                        <h5><FontAwesomeIcon icon="sync-alt" />Repeat</h5>
                                        <div className="command_desc">
                                            <p>Active le mode répétition pour la musique en cours d'écoute.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/help"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(5)}
                                        onMouseLeave={() => this.handleMouseLeave(5)}>
                                        <h5><FontAwesomeIcon icon="question" />Help</h5>
                                        <div className="command_desc">
                                            <p>Affiche les commandes disponibles ou les détails d'une commande en particulier.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/next"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(6)}
                                        onMouseLeave={() => this.handleMouseLeave(6)}>
                                        <h5><FontAwesomeIcon icon="step-forward" />Next</h5>
                                        <div className="command_desc">
                                            <p>Permet de passer à la musique suivante.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/pause"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(7)}
                                        onMouseLeave={() => this.handleMouseLeave(7)}>
                                        <h5><FontAwesomeIcon icon="pause" />Pause</h5>
                                        <div className="command_desc">
                                            <p>Met la musique en pause pour la reprendre plus tard.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/resume"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(8)}
                                        onMouseLeave={() => this.handleMouseLeave(8)}>
                                        <h5><FontAwesomeIcon icon="play" />Resume</h5>
                                        <div className="command_desc">
                                            <p>Reprend la musique là où vous l'aviez arrêtée.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/quit"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(9)}
                                        onMouseLeave={() => this.handleMouseLeave(9)}>
                                        <h5><FontAwesomeIcon icon="sign-out-alt" />Quit</h5>
                                        <div className="command_desc">
                                            <p>Se déconnecte du salon vocal et supprime les musiques en file d'attente.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/remove"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(10)}
                                        onMouseLeave={() => this.handleMouseLeave(10)}>
                                        <h5><FontAwesomeIcon icon="eraser" />Remove</h5>
                                        <div className="command_desc">
                                            <p>Supprime le nombre de message désiré.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/clear"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(11)}
                                        onMouseLeave={() => this.handleMouseLeave(11)}>
                                        <h5><FontAwesomeIcon icon="trash-alt" />Clear</h5>
                                        <div className="command_desc">
                                            <p>Supprime tout les messages chargés du salon.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/search"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(12)}
                                        onMouseLeave={() => this.handleMouseLeave(12)}>
                                        <h5><FontAwesomeIcon icon="search" />Search</h5>
                                        <div className="command_desc">
                                            <p>Affiche la liste des résultats d'une recherche, sélectionne un des résultats.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                    <a
                                        href="/docs/radio"
                                        className="docs_content_command"
                                        onMouseEnter={() => this.handleMouseEnter(13)}
                                        onMouseLeave={() => this.handleMouseLeave(13)}>
                                        <h5><FontAwesomeIcon icon="rss" />Radio</h5>
                                        <div className="command_desc">
                                            <p>Permet d'écouter la radio en la sélectionnant par son nom.</p>
                                            {/* <p><FontAwesomeIcon icon="arrow-circle-up" /></p> */}
                                        </div>
                                        {/* <p className="open_desc"><FontAwesomeIcon icon="arrow-circle-down" /></p> */}
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

Docs.propTypes = {
    command: PropTypes.string.isRequired
};