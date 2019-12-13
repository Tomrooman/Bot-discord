"use strict";

import React from 'react';
import PropTypes from "prop-types";
import Play from './play/play.jsx';
import Sidebar from './sidebar/sidebar.jsx';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook } from '@fortawesome/free-solid-svg-icons';

library.add(faBook);

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
        }, 200)
    }

    handleMouseEnter(command) {
        console.log('command hover : ', command)
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

    render() {
        return (
            <div className='wrapper'>
                <Sidebar command={this.state.command} />
                <div id="content" className="content">
                    {this.state.page ?
                        this.state.page :
                        <div className="syx_container">
                            <h1><FontAwesomeIcon icon="book" />
                                Documentation
                            </h1>
                            <div className="docs_content">
                                <div className="docs_panel">
                                    <p className="h5">Bienvenue sur la docs de syxbot</p>
                                    <p>N'hésitez pas à me contacter pour toute(s) question(s), idée(s) de modification(s), etc ...</p>
                                </div>
                                <h4>Toutes les commandes disponibles</h4>
                                <a
                                    href="/docs/play"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(0)}
                                    onMouseLeave={() => this.handleMouseLeave(0)}>
                                    <h5>Play</h5>
                                </a>
                                <a
                                    href="/docs/playlist"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(1)}
                                    onMouseLeave={() => this.handleMouseLeave(1)}>
                                    <h5>Playlist</h5>
                                </a>
                                <a
                                    href="/docs/cancel"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(2)}
                                    onMouseLeave={() => this.handleMouseLeave(2)}>
                                    <h5>Cancel</h5>
                                </a>
                                <a
                                    href="/docs/go"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(3)}
                                    onMouseLeave={() => this.handleMouseLeave(3)}>
                                    <h5>Go</h5>
                                </a>
                                <a
                                    href="/docs/loop"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(4)}
                                    onMouseLeave={() => this.handleMouseLeave(4)}>
                                    <h5>Loop</h5>
                                </a>
                                <a
                                    href="/docs/help"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(5)}
                                    onMouseLeave={() => this.handleMouseLeave(5)}>
                                    <h5>Help</h5>
                                </a>
                                <a
                                    href="/docs/next"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(6)}
                                    onMouseLeave={() => this.handleMouseLeave(6)}>
                                    <h5>Next</h5>
                                </a>
                                <a
                                    href="/docs/pause"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(7)}
                                    onMouseLeave={() => this.handleMouseLeave(7)}>
                                    <h5>Pause</h5>
                                </a>
                                <a
                                    href="/docs/resume"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(8)}
                                    onMouseLeave={() => this.handleMouseLeave(8)}>
                                    <h5>Resume</h5>
                                </a>
                                <a
                                    href="/docs/quit"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(9)}
                                    onMouseLeave={() => this.handleMouseLeave(9)}>
                                    <h5>Quit</h5>
                                </a>
                                <a
                                    href="/docs/remove"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(10)}
                                    onMouseLeave={() => this.handleMouseLeave(10)}>
                                    <h5>Remove</h5>
                                </a>
                                <a
                                    href="/docs/clear"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(11)}
                                    onMouseLeave={() => this.handleMouseLeave(11)}>
                                    <h5>Clear</h5>
                                </a>
                                <a
                                    href="/docs/search"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(12)}
                                    onMouseLeave={() => this.handleMouseLeave(12)}>
                                    <h5>Search</h5>
                                </a>
                                <a
                                    href="/docs/radio"
                                    className="docs_content_command"
                                    onMouseEnter={() => this.handleMouseEnter(13)}
                                    onMouseLeave={() => this.handleMouseLeave(13)}>
                                    <h5>Radio</h5>
                                </a>
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