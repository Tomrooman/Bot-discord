"use strict";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons';
library.add(faHeadphonesAlt);

export default class Play extends React.Component {

    constructor() {
        super()
    }

    render() {
        return (
            <div className="syx_container">
                <h1><FontAwesomeIcon icon="headphones-alt" /> Play</h1>
                <div className="top_logo"><img src="/img/Syxbot_logo.png"></img></div>
            </div >
        )
    }

}