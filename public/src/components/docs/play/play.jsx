"use strict";

import React from 'react';

export default class Play extends React.Component {

    constructor() {
        super()
    }

    render() {
        return (
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
                <h1>Commande play</h1>
            </div>
        )
    }

}