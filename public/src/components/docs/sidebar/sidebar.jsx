"use strict";

import React from 'react';
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBookmark, faListUl, faHome, faPenFancy, faPause, faListOl, faHeadphonesAlt, faWindowClose, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { faStepForward, faTrashAlt, faRss, faPlay, faSyncAlt, faEraser, faSignOutAlt, faSearch, faForward } from '@fortawesome/free-solid-svg-icons';
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

export default class Sidebar extends React.Component {

    handleMouseEnter(command) {
        if ($('.docs_content_command')[command]) {
            $('.docs_content_command')[command].children[0].style.background = 'rgb(95, 59, 109)'
            $('.docs_content_command')[command].style.transform = 'translateY(-30px)'
        }
    }

    handleMouseLeave(command) {
        if ($('.docs_content_command')[command]) {
            $('.docs_content_command')[command].children[0].style.background = ''
            $('.docs_content_command')[command].style.transform = ''
        }
    }

    render() {
        return (
            <nav id='sidebar'>
                <div className='sidebar-header'>
                    <h3><FontAwesomeIcon icon="bookmark" />Menu</h3>
                </div>
                <div className="toggleSideMenu">
                    <button type="button" id="sidebarCollapse" className="navbar-btn">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
                <ul className="list-unstyled components">
                    <li className={!this.props.command ? 'active' : ''}>
                        <a href="/docs"><FontAwesomeIcon icon="home" /> Accueil</a>
                    </li>
                    <li className={this.props.command === 'contact' ? 'active' : ''}>
                        <a href="/docs/contact"><FontAwesomeIcon icon="pen-fancy" />Me contacter</a>
                    </li>

                    <h5 id='command_list_title'><FontAwesomeIcon icon="list-ul" />Liste des commandes</h5>
                    <li id='command_list'>
                        <a
                            href="/docs/play"
                            className={this.props.command === 'play' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(0)}
                            onMouseLeave={() => this.handleMouseLeave(0)}>
                            <FontAwesomeIcon icon="headphones-alt" />Play
                        </a>
                        <a
                            href="/docs/playlist"
                            className={this.props.command === 'playlist' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(1)}
                            onMouseLeave={() => this.handleMouseLeave(1)}>
                            <FontAwesomeIcon icon="list-ol" />Playlist
                        </a>
                        <a
                            href="/docs/cancel"
                            className={this.props.command === 'cancel' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(2)}
                            onMouseLeave={() => this.handleMouseLeave(2)}>
                            <FontAwesomeIcon icon="window-close" />Cancel
                        </a>
                        <a
                            href="/docs/go"
                            className={this.props.command === 'go' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(3)}
                            onMouseLeave={() => this.handleMouseLeave(3)}>
                            <FontAwesomeIcon icon="forward" />Go
                        </a>
                        <a
                            href="/docs/loop"
                            className={this.props.command === 'loop' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(4)}
                            onMouseLeave={() => this.handleMouseLeave(4)}>
                            <FontAwesomeIcon icon="sync-alt" />Loop
                        </a>
                        <a
                            href="/docs/help"
                            className={this.props.command === 'help' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(5)}
                            onMouseLeave={() => this.handleMouseLeave(5)}>
                            <FontAwesomeIcon icon="question" />Help
                        </a>
                        <a
                            href="/docs/next"
                            className={this.props.command === 'next' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(6)}
                            onMouseLeave={() => this.handleMouseLeave(6)}>
                            <FontAwesomeIcon icon="step-forward" />Next
                        </a>
                        <a
                            href="/docs/pause"
                            className={this.props.command === 'pause' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(7)}
                            onMouseLeave={() => this.handleMouseLeave(7)}>
                            <FontAwesomeIcon icon="pause" />Pause
                        </a>
                        <a
                            href="/docs/resume"
                            className={this.props.command === 'resume' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(8)}
                            onMouseLeave={() => this.handleMouseLeave(8)}>
                            <FontAwesomeIcon icon="play" />Resume
                        </a>
                        <a
                            href="/docs/quit"
                            className={this.props.command === 'quit' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(9)}
                            onMouseLeave={() => this.handleMouseLeave(9)}>
                            <FontAwesomeIcon icon="sign-out-alt" />Quit
                        </a>
                        <a
                            href="/docs/remove"
                            className={this.props.command === 'remove' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(10)}
                            onMouseLeave={() => this.handleMouseLeave(10)}>
                            <FontAwesomeIcon icon="eraser" />Remove
                        </a>
                        <a
                            href="/docs/clear"
                            className={this.props.command === 'clear' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(11)}
                            onMouseLeave={() => this.handleMouseLeave(11)}>
                            <FontAwesomeIcon icon="trash-alt" />Clear
                        </a>
                        <a
                            href="/docs/search"
                            className={this.props.command === 'search' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(12)}
                            onMouseLeave={() => this.handleMouseLeave(12)}>
                            <FontAwesomeIcon icon="search" />Search
                        </a>
                        <a
                            href="/docs/radio"
                            className={this.props.command === 'radio' ? 'active' : ''}
                            onMouseEnter={() => this.handleMouseEnter(13)}
                            onMouseLeave={() => this.handleMouseLeave(13)}>
                            <FontAwesomeIcon icon="rss" />Radio
                        </a>
                    </li>
                </ul>
            </nav>
        )
    }
}

Sidebar.propTypes = {
    command: PropTypes.string.isRequired
};