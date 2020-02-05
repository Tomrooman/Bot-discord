'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import Config from './../../../../../config.json';

export default class Navbar extends React.Component {
    render() {
        return (
            <nav className='navbar navbar-expand-lg'>
                <a className='navbar-brand' href='/'>
                    <img src='/img/Syxbot_logo.png' width='30' height='30' className='d-inline-block align-top' alt='syxbot_logo' />
                    Syxbot
                </a>
                <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#navbarSupportedContent' aria-controls='navbarSupportedContent' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon' />
                </button>

                <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                    <ul className='navbar-nav mr-auto'>
                        <li className='nav-item active'>
                            <a className='nav-link' href='/'>Accueil <span className='sr-only'>(current)</span></a>
                        </li>
                    </ul>
                    <div className='form-inline my-2 my-lg-0'>
                        {
                            this.props.user ?
                                <div className='dropdown'>
                                    <button className='btn btn-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                        {this.props.user.username}<span className='discriminator'>#{this.props.user.discriminator}</span>
                                    </button>
                                    <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                                        {/* <a className='dropdown-item' href='#'>Action</a> */}
                                        <button
                                            onClick={() => this.props.disconnect()}
                                        >
                                            Se déconnecter
                                        </button>
                                    </div>
                                </div> :
                                <a href={`${Config.OAuth.connection_url}&state=${this.props.randStr}`}>
                                    <button className='connect-btn'>
                                        Se connecter
                                    </button>
                                </a>
                        }
                    </div>
                </div>
            </nav>
        );
    }
}

Navbar.propTypes = {
    randStr: PropTypes.string.isRequired,
    user: PropTypes.oneOfType([
        PropTypes.object.isRequired,
        PropTypes.bool.isRequired
    ]),
    disconnect: PropTypes.func.isRequired
};
