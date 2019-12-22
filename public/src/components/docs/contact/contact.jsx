"use strict"

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

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
        if (this.state.mail.length >= 1 && this.state.object.length >= 1 && this.state.message.length >= 1) {
            axios.post('/api/docs/contact', { mail: 'Mail de test' })
                .then(res => {
                    console.log('Respond to contact api : ', res)
                })
        }
    }

    handleOnChange(type, e) {
        this.setState({
            [type]: e.target.value
        }, () => {
            if (this.state.mail.length >= 1 && this.state.object.length >= 1 && this.state.message.length >= 1) {
                if ($('.contact-submit-div button')[0].style.opacity === '') {
                    $('.contact-submit-div button')[0].style.opacity = '1'
                    $('.contact-submit-div button')[0].style.cursor = 'pointer'
                }
            }
            else {
                if ($('.contact-submit-div button')[0].style.opacity === '1') {
                    $('.contact-submit-div button')[0].style.opacity = ''
                    $('.contact-submit-div button')[0].style.cursor = ''
                }
            }
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
                                onChange={(e) => this.handleOnChange('object', e)}
                            />
                        </div>
                        <div className="contact-message">
                            <label htmlFor='message'>Écrivez votre message ci-dessous *</label><br />
                            <textarea
                                type='text'
                                rows='4'
                                cols='30'
                                id='message'
                                onChange={(e) => this.handleOnChange('message', e)}
                            />
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