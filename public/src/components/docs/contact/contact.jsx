'use strict';

import React from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TextField from '@material-ui/core/TextField';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
library.add(faTimesCircle);

export default class Contact extends React.Component {
    constructor() {
        super();
        this.state = {
            mail: '',
            object: '',
            message: ''
        };
    }

    componentDidMount() {
        $('.alert')[0].style.display = 'none';
    }

    sendMessage() {
        if (this.state.mail.length >= 1 && this.state.object.length >= 1 && this.state.message.length >= 1) {
            $('.alert')[0].style.display = 'none';
            $('.contact-submit-div')[0].children[0].innerHTML = 'Envoi du message en cours ...';
            $('.contact-submit-div button')[0].style.opacity = '';
            $('.contact-submit-div button')[0].style.cursor = '';
            $('.alert')[0].className = 'contact alert';
            this.setState({
                mail: '',
                object: '',
                message: ''
            });
            axios.post('/api/docs/contact', {
                mail: this.state.mail,
                object: this.state.object,
                message: this.state.message
            })
                .then(res => {
                    $('.contact-submit-div')[0].children[0].innerHTML = 'Envoyer mon message';
                    if (res.data) {
                        $('input')[0].value = '';
                        $('input')[1].value = '';
                        $('textarea')[0].value = '';
                        $('.alert').addClass('alert-success');
                        $('.alert').html('<span>' + $('.alert')[0].children[0].innerHTML + '</span><span style="display: none">' + $('.alert')[0].children[1].innerHTML + '</span> Message envoyé !');
                        $('.alert')[0].style.display = '';
                    }
                    else {
                        this.handleError();
                    }
                })
                .catch(() => {
                    $('.contact-submit-div')[0].children[0].innerHTML = 'Envoyer mon message';
                    this.handleError();
                });
        }
    }

    handleError() {
        this.setState({
            mail: $('input')[0].value,
            object: $('input')[1].value,
            message: $('textarea')[0].value
        });
        $('.contact-submit-div button')[0].style.opacity = '1';
        $('.contact-submit-div button')[0].style.cursor = 'pointer';
        $('.alert').addClass('alert-danger');
        $('.alert').html('<span style="display: none">' + $('.alert')[0].children[0].innerHTML + '</span><span>' + $('.alert')[0].children[1].innerHTML + '</span> Une erreur est survenue, veuillez réessayer ou me contacter à cette adresse : syxbot@hotmail.com');
        $('.alert')[0].style.display = '';
    }

    handleOnChange(type, e) {
        this.setState({
            [type]: e.target.value
        }, () => {
            if (this.state.mail.length >= 1 && this.state.object.length >= 1 && this.state.message.length >= 1) {
                if ($('.contact-submit-div button')[0].style.opacity === '') {
                    $('.contact-submit-div button')[0].style.opacity = '1';
                    $('.contact-submit-div button')[0].style.cursor = 'pointer';
                }
            }
            else if ($('.contact-submit-div button')[0].style.opacity === '1') {
                $('.contact-submit-div button')[0].style.opacity = '';
                $('.contact-submit-div button')[0].style.cursor = '';
            }
        });
    }

    render() {
        return (
            <div className='syx_container'>
                <h1><FontAwesomeIcon icon='pen-fancy' /> Me contacter</h1>
                <div className='docs_content'>
                    <div className='contact alert'>
                        <span className='success-icon'><FontAwesomeIcon icon='check' /></span>
                        <span className='error-icon'><FontAwesomeIcon icon='times-circle' /></span>
                    </div>
                    <div className='docs-contact'>
                        <h3>Formulaire</h3>
                        <div className='contact-mail'>
                            <TextField
                                required
                                id='required-mail'
                                label='Votre adresse mail'
                                placeholder='Exemple@hotmail.com'
                                variant='outlined'
                                onChange={(e) => this.handleOnChange('mail', e)}
                            />
                        </div>
                        <div className='contact-object'>
                            <TextField
                                required
                                id='required-object'
                                label='Objet'
                                variant='outlined'
                                onChange={(e) => this.handleOnChange('object', e)}
                            />
                        </div>
                        <div className='contact-message'>
                            <label htmlFor='message'>Écrivez votre message ci-dessous *</label><br />
                            <textarea
                                type='text'
                                rows='4'
                                cols='30'
                                id='message'
                                onChange={(e) => this.handleOnChange('message', e)}
                            />
                        </div>
                        <div className='contact-submit-div'>
                            <button onClick={() => this.sendMessage()}>Envoyer mon message</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
