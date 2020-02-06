'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Config from './../../../../../config.json';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faBook, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

library.add(faSignOutAlt);
library.add(faDiscord);
library.add(faUserCircle);
library.add(faBook);
library.add(faGamepad);

export default class Navbar extends React.Component {
    render() {
        return (
            <nav className='navbar navbar-expand-lg navbar-dark navbar-site'>
                <a className='navbar-brand' href='/'>
                    <img src='/img/Syxbot_logo.png' width='30' height='30' className='d-inline-block align-top' alt='syxbot_logo' />
                    Syxbot
                </a>
                <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon' />
                </button>
                <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                    <ul className='navbar-nav mr-auto'>
                        <li className={this.props.page === '/' ? 'nav-item active' : 'nav-item'}>
                            <a className='nav-link' href='/'><FontAwesomeIcon icon='home' /> Accueil</a>
                        </li>
                        {this.props.user ?
                            <li className={this.props.page === 'controls' ? 'nav-item active' : 'nav-item'}>
                                <a className='nav-link' href='/controls'><FontAwesomeIcon icon='gamepad' /> Contrôler le bot</a>
                            </li> : ''}
                    </ul>
                </div>
                <div className='form-inline my-2 my-lg-0'>
                    <a href='/docs'>
                        <button className='docs-btn'>
                            <FontAwesomeIcon icon='book' /> Documentation
                        </button>
                    </a>
                    {
                        this.props.user ?
                            <div className='dropdown'>
                                <button className='user-dropdown dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                    <span className='username'>
                                        <FontAwesomeIcon icon='user-circle' /> {this.props.user.username}
                                    </span>
                                    <span className='discriminator'>
                                        #{this.props.user.discriminator}
                                    </span>
                                </button>
                                <div className='dropdown-menu dropdown-menu-right user-dropdown-list' aria-labelledby='dropdownMenuButton'>
                                    {/* <a className='dropdown-item' href='#'>Action</a> */}
                                    <p
                                        className='dropdown-item dropdown-disconnect'
                                        onClick={() => this.props.disconnect()}
                                    >
                                        <FontAwesomeIcon icon='sign-out-alt' /> Se déconnecter
                                    </p>
                                </div>
                            </div> :
                            <a href={`${Config.OAuth.connection_url}&state=${this.props.randStr}`}>
                                <button className='connect-btn'>
                                    <FontAwesomeIcon icon={['fab', 'discord']} /> Se connecter
                                </button>
                            </a>
                    }
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = {
    page: PropTypes.string.isRequired,
    randStr: PropTypes.oneOfType([
        PropTypes.string.isRequired,
        PropTypes.bool.isRequired
    ]),
    user: PropTypes.oneOfType([
        PropTypes.object.isRequired,
        PropTypes.bool.isRequired
    ]),
    disconnect: PropTypes.func.isRequired
};
