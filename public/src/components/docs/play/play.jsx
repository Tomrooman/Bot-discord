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
                        <button type="button" id="sidebarCollapse" className="btn btn-info">
                            <i className="fas fa-align-left"></i>
                            <span> Commande play </span>
                        </button>
                    </div>
                </nav>
            </div>
        )
    }

}