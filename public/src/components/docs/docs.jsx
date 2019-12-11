"use strict";

import React from 'react';
import Play from './play/play.jsx';

import './docs.css';

export default class Docs extends React.Component {

    constructor(props) {
        super()
        let page = null
        if (props.command === 'play') {
            console.log('command play')
            page = <Play />
        }
        this.state = {
            command: props.command,
            page: page
        }
    }

    render() {
        return (
            <div className='wrapper'>
                <nav id='sidebar'>
                    <div className='sidebar-header'>
                        <h3>Documentation</h3>
                        <img src='/img/Syxbot_logo.png' alt='syxbot_logo'></img>
                    </div>
                    <ul className="list-unstyled components">
                        <li className={this.state.command === 'play' ? 'active' : ''}>
                            <a href="#">Accueil</a>
                        </li>
                        {/* <li className="active">
                            <a href="#homeSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Home</a>
                            <ul className="collapse list-unstyled" id="homeSubmenu">
                                <li>
                                    <a href="#">Home 1</a>
                                </li>
                                <li>
                                    <a href="#">Home 2</a>
                                </li>
                                <li>
                                    <a href="#">Home 3</a>
                                </li>
                            </ul>
                        </li> */}
                        <p>Liste des commandes</p>
                        <li>
                            <a href="#pageSubmenu" data-toggle="collapse" aria-expanded="false" className="dropdown-toggle">Pages</a>
                            <ul className="collapse list-unstyled" id="pageSubmenu">
                                <li>
                                    <a href="#">Page 1</a>
                                </li>
                                <li>
                                    <a href="#">Page 2</a>
                                </li>
                                <li>
                                    <a href="#">Page 3</a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#">Contact</a>
                        </li>
                    </ul>
                </nav>
                {this.state.page ?
                    this.state.page :
                    <div id="content">
                        <nav className="navbar navbar-expand-lg navbar-light bg-light">
                            <div className="container-fluid">
                                <button type="button" id="sidebarCollapse" className="btn btn-info">
                                    <i className="fas fa-align-left"></i>
                                </button>
                            </div>
                        </nav>
                    </div>}
            </div>
        )
    }
}