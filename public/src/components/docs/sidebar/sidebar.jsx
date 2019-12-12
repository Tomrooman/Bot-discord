"use strict";

import React from 'react';
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBookmark, faListUl, faHome, faPenFancy } from '@fortawesome/free-solid-svg-icons'

library.add(faBookmark);
library.add(faListUl);
library.add(faHome);
library.add(faPenFancy);

export default class Sidebar extends React.Component {

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
                        <a href="/docs/play" className={this.props.command === 'play' ? 'active' : ''}>Play</a>
                        <a href="/docs/playlist" className={this.props.command === 'playlist' ? 'active' : ''}>Playlist</a>
                        <a href="/docs/cancel" className={this.props.command === 'cancel' ? 'active' : ''}>Cancel</a>
                        <a href="/docs/go" className={this.props.command === 'go' ? 'active' : ''}>Go</a>
                        <a href="/docs/loop" className={this.props.command === 'loop' ? 'active' : ''}>Loop</a>
                        <a href="/docs/help" className={this.props.command === 'help' ? 'active' : ''}>Help</a>
                        <a href="/docs/next" className={this.props.command === 'next' ? 'active' : ''}>Next</a>
                        <a href="/docs/pause" className={this.props.command === 'pause' ? 'active' : ''}>Pause</a>
                        <a href="/docs/resume" className={this.props.command === 'resume' ? 'active' : ''}>Resume</a>
                        <a href="/docs/quit" className={this.props.command === 'quit' ? 'active' : ''}>Quit</a>
                        <a href="/docs/remove" className={this.props.command === 'remove' ? 'active' : ''}>Remove</a>
                        <a href="/docs/clear" className={this.props.command === 'clear' ? 'active' : ''}>Clear</a>
                        <a href="/docs/search" className={this.props.command === 'search' ? 'active' : ''}>Search</a>
                        <a href="/docs/radio" className={this.props.command === 'radio' ? 'active' : ''}>Radio</a>
                    </li>
                </ul>
            </nav>
        )
    }
}

Sidebar.propTypes = {
    command: PropTypes.string.isRequired
};