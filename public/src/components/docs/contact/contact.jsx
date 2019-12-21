"use strict"

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

library.add(faInfoCircle);

export default class Contact extends React.Component {

    render() {
        return (
            <div className="syx_container">
                <h1><FontAwesomeIcon icon="pen-fancy" /> Me contacter</h1>
                <div className="top_logo"><img src="/img/Syxbot_logo.png"></img></div>
                <div className="docs_content">
                    <div className="docs_panel warning">
                        <p><FontAwesomeIcon icon="info-circle" /> Tous les champs doivent être remplis pour envoyer le message.</p>
                    </div>
                    <div className='docs-contact'>
                        <h3>Formulaire</h3>
                        <div className='contact-label'>
                            <label htmlFor='email'>Votre adresse mail</label><br />
                            <label htmlFor='object'>Objet</label>
                            <label htmlFor='message'>Message</label>
                        </div>
                        <div className='contact-input'>
                            <input type='email' id='email'></input><br />
                            <input type='text' id='object'></input>
                            <textarea type='text' rows='7' cols='20' id='message'></textarea>
                        </div>
                        <div className="contact-submit-div">
                            <button>Envoyer mon message</button>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}