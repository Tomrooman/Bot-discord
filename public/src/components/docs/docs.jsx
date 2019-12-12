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

    render() {
        return (
            <div className='wrapper'>
                <Sidebar command={this.state.command} />
                <div id="content" className="content">
                    {this.state.page ?
                        this.state.page :
                        <div className="syx_container">
                            <h1><FontAwesomeIcon icon="book" />
                                Documentation syxbot
                            </h1>
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