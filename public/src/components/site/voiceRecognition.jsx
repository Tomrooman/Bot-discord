'use strict';

import React from 'react';
import _ from 'lodash';

export default class VoiceRecognition extends React.Component {
    constructor() {
        super();
        this.state = {
            listening: false
        };
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.handleToggleListen = this.handleToggleListen.bind(this);
        this.handleListen = this.handleListen.bind(this);
    }

    handleToggleListen() {
        if (this.recognition) {
            this.setState({
                listening: !this.state.listening
            }, this.handleListen);
        }
        else {
            alert('Les commandes vocales ne fonctionnent pas avec ce navigateur ! Utilisez google chrome');
        }
    }

    handleListen() {
        console.log('listening : ', this.state.listening);
        if (this.state.listening) {
            this.recognition.start();
            this.recognition.onend = () => {
                console.log('...continue listening...');
                this.recognition.start();
            };
        }
        else {
            this.recognition.stop();
            this.recognition.onend = {};
        }
        this.recognition.onstart = () => {
            console.log('Listening!');
        };
        this.recognition.onerror = event => {
            console.log('Error occurred in recognition: ' + event.error);
        };
        this.recognition.onresult = event => {
            this.getCommands(event);
        };
    }

    getCommands(event) {
        const finalTranscript = _.find(event.results, { isFinal: true })[0].transcript;
        console.log('transcript : ', finalTranscript);
        document.getElementById('final').innerHTML = finalTranscript;
        const commands = finalTranscript.split(' ');
        console.log('Commandes : ', commands);
        if (commands[0] === 'stop' && commands[1] === 'listening') {
            this.recognition.stop();
            this.recognition.onend = () => {
                console.log('Stopped listening per command');
                this.setState({
                    listening: false
                });
                const finalText = commands.join(' ');
                document.getElementById('final').innerHTML = finalText;
            };
        }
    }

    render() {
        return (
            <div className='microphone'>
                <button id='microphone-btn' onClick={this.handleToggleListen} />
                <div id='final' />
            </div>
        );
    }
}
