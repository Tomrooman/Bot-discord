'use strict';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons';
library.add(faHeadphonesAlt);

export default class Play extends React.Component {
    render() {
        return (
            <div className='syx_container'>
                <h1><FontAwesomeIcon icon='headphones-alt' /> Play</h1>
            </div>
        );
    }
}
