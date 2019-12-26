'use strict'

import React from 'react'
import $ from 'jquery'
import PropTypes from 'prop-types'
import Play from './play/play.jsx'
import Contact from './contact/contact.jsx'
import Sidebar from './sidebar/sidebar.jsx'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import './docs.css'
library.add(faCheck)

export default class Docs extends React.Component {
    constructor(props) {
        super()
        let page = null
        if (props.command === 'play') {
            page = <Play />
        }
        else if (props.command === 'contact') {
            page = <Contact />
        }
        this.state = {
            command: props.command,
            page: page
        }
        this.createCommandsArray()
    }

    createCommandsArray() {
        this.commands = [
            { name: 'Play', icon: 'headphones-alt', description: 'Rajoute une musique avec l\'URL, sélectionne une musique, recherche d\'une musique par titre, ...' },
            { name: 'Playlist', icon: 'list-ol', description: 'Rajoute une playlist avec l\'URL, sélectionne une musique, recherche d\'une playlist par titre, ...' },
            { name: 'Cancel', icon: 'window-close', description: 'Annule une recherche de musique ou playlist dans le cas où il ne trouverait pas de résultats.' },
            { name: 'Go', icon: 'forward', description: 'Passe directement à la musique de la file d\'attente sélectionnée.' },
            { name: 'Repeat', icon: 'sync-alt', description: 'Active le mode répétition pour la musique en cours d\'écoute.' },
            { name: 'Help', icon: 'question', description: 'Affiche les commandes disponibles ou les détails d\'une commande en particulier.' },
            { name: 'Next', icon: 'step-forward', description: 'Permet de passer à la musique suivante.' },
            { name: 'Pause', icon: 'pause', description: 'Met la musique en pause pour la reprendre plus tard.' },
            { name: 'Stop', icon: 'stop', description: 'Arrête la musique et supprime la file d\'attente.' },
            { name: 'Resume', icon: 'play', description: 'Reprend la musique là où vous l\'aviez arrêtée.' },
            { name: 'Quit', icon: 'sign-out-alt', description: 'Se déconnecte du salon vocal et supprime les musiques en file d\'attente.' },
            { name: 'Remove', icon: 'eraser', description: 'Supprime le nombre de message désiré.' },
            { name: 'Clear', icon: 'trash-alt', description: 'Supprime tout les messages chargés du salon.' },
            { name: 'Search', icon: 'search', description: 'Affiche la liste des résultats d\'une recherche, sélectionne un des résultats.' },
            { name: 'Radio', icon: 'rss', description: 'Permet d\'écouter la radio en la sélectionnant par son nom.' }
        ]
    }

    componentDidMount() {
        // Appear effect
        setTimeout(() => {
            $('.syx_container h1').addClass('load')
            $('.top_logo').addClass('load')
            if ($('.docs_panel')) {
                setTimeout(() => {
                    $('.docs_panel').addClass('load')
                }, 200)
            }
            if ($('.div_docs_content_command')) {
                setTimeout(() => {
                    $('.div_docs_content_command').addClass('load')
                }, 400)
            }
            if (this.state.command === 'contact') {
                if ($('.docs-contact')) {
                    setTimeout(() => {
                        $('.docs-contact').addClass('load')
                    }, 400)
                }
            }
        }, 200)
    }

    handleMouseEnter(index) {
        // Set hover effect for sidebar element
        $('#command_list a')[index].style.color = 'rgb(93, 67, 126)'
        $('#command_list a')[index].style.letterSpacing = '5px'
        $('#command_list a')[index].style.background = '#f0f0f0'
        $('#command_list a')[index].style.borderLeft = '5px solid rgba(93, 67, 126, 0.74)'
        $('#command_list a')[index].style.boxShadow = '-5px 0px 4px rgb(93, 67, 126, 1)'
    }

    handleMouseLeave(index) {
        // Remove hover effect for sidebar element
        $('#command_list a')[index].style.color = ''
        $('#command_list a')[index].style.background = ''
        $('#command_list a')[index].style.borderLeft = ''
        $('#command_list a')[index].style.boxShadow = ''
        $('#command_list a')[index].style.letterSpacing = ''
    }

    handleMouseEnterContactBtn() {
        // Set hover effect for sidebar contact element
        $('.components')[0].children[1].children[0].style.color = 'rgb(93, 67, 126)'
        $('.components')[0].children[1].style.letterSpacing = '5px'
        $('.components')[0].children[1].style.background = '#f0f0f0'
        $('.components')[0].children[1].children[0].style.borderLeft = '5px solid rgba(93, 67, 126, 0.74)'
        $('.components')[0].children[1].style.boxShadow = '-5px 0px 4px rgb(93, 67, 126, 1)'
    }

    handleMouseLeaveContactBtn() {
        // Remove hover effect for sidebar contact element
        $('.components')[0].children[1].children[0].style.color = ''
        $('.components')[0].children[1].style.letterSpacing = ''
        $('.components')[0].children[1].style.background = ''
        $('.components')[0].children[1].children[0].style.borderLeft = ''
        $('.components')[0].children[1].style.boxShadow = ''
    }

    render() {
        if (this.state.page) {
            return (
                <div className='wrapper'>
                    <Sidebar command={this.state.command} />
                    <div id='content' className='content'>
                        {this.state.page}
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className='wrapper'>
                    <Sidebar command={this.state.command} />
                    <div id='content' className='content'>
                        <div className='syx_container'>
                            <h1><FontAwesomeIcon icon='home' />
                                Accueil
                            </h1>
                            <div className='top_logo'><img src='/img/Syxbot_logo.png' /></div>
                            <div className='docs_content'>
                                <div className='docs_panel'>
                                    <p className='h5'>Bienvenue sur la docs de syxbot</p>
                                    <p>N'hésitez pas à me contacter pour toute(s) question(s), idée(s) de modification(s), etc ...</p>
                                    <a href='/docs/contact'>
                                        <button
                                            className='contact-btn'
                                            onMouseEnter={this.handleMouseEnterContactBtn}
                                            onMouseLeave={this.handleMouseLeaveContactBtn}
                                        >
                                            Me contacter
                                        </button>
                                    </a>
                                </div>
                                <div className='div_docs_content_command'>
                                    <h4><FontAwesomeIcon icon='check' /> Les commandes disponibles</h4>
                                    {this.commands.map((obj, index) => {
                                        return (
                                            <a
                                                href={`/docs/${obj.name.toLowerCase()}`}
                                                className='docs_content_command'
                                                key={index}
                                                onMouseEnter={() => this.handleMouseEnter(index)}
                                                onMouseLeave={() => this.handleMouseLeave(index)}
                                            >
                                                <h5><FontAwesomeIcon icon={obj.icon} />{obj.name}</h5>
                                                <div className='command_desc'>
                                                    <p>{obj.description}</p>
                                                </div>
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

Docs.propTypes = {
    command: PropTypes.string.isRequired
}
