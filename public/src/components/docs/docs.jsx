"use strict";

import React from 'react';
import Play from './play/play.jsx';
import Sidebar from './sidebar/sidebar.jsx';

import './docs.css';

export default class Docs extends React.Component {

    constructor(props) {
        super()
        let page = null
        if (props.command === 'play') {
            page = <Play />
        }
        console.log('command : ', props.command)
        this.state = {
            command: props.command,
            page: page
        }
    }

    render() {
        return (
            <div className='wrapper'>
                <Sidebar command={this.state.command} />
                {this.state.page ?
                    this.state.page :
                    <div id="content">
                        <nav className="navbar navbar-expand-lg navbar-light bg-light">
                            <div className="container-fluid">
                                <button type="button" id="sidebarCollapse" className="navbar-btn">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </button>
                            </div>
                        </nav>
                    </div>}
            </div>
        )
    }
}