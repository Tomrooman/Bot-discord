"use strict"

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import TextField from '@material-ui/core/TextField';

library.add(faInfoCircle);

export default class Contact extends React.Component {

    constructor() {
        super()
        this.state = {
            mail: '',
            object: '',
            message: ''
        }
    }

    sendMessage() {
        console.log('all data to send')
    }

    handleOnChange(type, e) {
        console.log(type + ' : ', e.target.value)
        this.setState({
            [type]: e.target.value
        })
    }

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
                        <div className="contact-mail">
                            <TextField
                                required
                                id="required-mail"
                                label="Votre adresse mail"
                                placeholder="Exemple@hotmail.com"
                                variant="outlined"
                                onChange={(e) => this.handleOnChange('mail', e)}
                            />
                        </div>
                        <div className="contact-object">
                            <TextField
                                required
                                id="required-object"
                                label="Objet"
                                variant="outlined"
                            />
                        </div>
                        <div className="contact-message">
                            <label htmlFor='message'>Écrivez votre message ci-dessous *</label><br />
                            <textarea type='text' rows='4' cols='30' id='message'></textarea>
                        </div>
                        <div className="contact-submit-div">
                            <button onClick={() => this.sendMessage()}>Envoyer mon message</button>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}