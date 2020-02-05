'use strict';

import React from 'react';
import Cookies from 'universal-cookie';
// import VoiceRecognition from './voiceRecognition.jsx';
import FormData from 'form-data';
import Config from './../../../../config.json';
import Axios from 'axios';
import './site.css';
import Navbar from './navbar/navbar.jsx';

const cookies = new Cookies();

export default class Site extends React.Component {
    constructor() {
        super();
        this.generateRandomString = this.generateRandomString.bind(this);
        this.state = {
            randStr: false,
            user: cookies.get('syxbot') || false
        };
    }

    componentDidMount() {
        const fragment = new URLSearchParams(window.location.search);
        if (fragment.has('code')) {
            this.connectUser(fragment);
        }
        else if (this.state.user) {
            this.verifyTokenExpiration();
        }
        else {
            this.generateRandomString();
        }
    }

    verifyTokenExpiration() {
        const diffH = Math.floor((this.state.user.expire_at - (Date.now() / 1000)) / 3600);
        console.log((this.state.user.expire_at - (Date.now() / 1000)) / 3600);
        console.log('Difference : ', diffH);
        if (diffH <= 0) {
            Axios.post('/api/token/get', { userId: this.state.user.id })
                .then(res => {
                    const data = new FormData();
                    data.append('client_id', Config.clientId);
                    data.append('client_secret', Config.secret);
                    data.append('grant_type', 'refresh_token');
                    data.append('refresh_token', res.data.refresh_token);
                    data.append('redirect_uri', Config.OAuth.redirect_url);
                    data.append('scope', Config.OAuth.scope);
                    this.getToken(data);
                });
        }
    }

    connectUser(fragment) {
        const urlState = fragment.get('state');
        const code = fragment.get('code');
        const stateParameter = localStorage.getItem('stateParameter');
        if (stateParameter === encodeURIComponent(urlState)) {
            const data = new FormData();
            data.append('client_id', Config.clientId);
            data.append('client_secret', Config.secret);
            data.append('grant_type', 'authorization_code');
            data.append('redirect_uri', Config.OAuth.redirect_url);
            data.append('scope', Config.OAuth.scope);
            data.append('code', code);
            this.getToken(data);
        }
        else {
            alert('Bad state parameter ! Réessayez de vous connecter');
            this.generateRandomString();
        }
    }

    getToken(data) {
        Axios.post('https://discordapp.com/api/oauth2/token', data)
            .then(res => {
                Axios.get('https://discordapp.com/api/users/@me', {
                    headers: {
                        authorization: `${res.data.token_type} ${res.data.access_token}`
                    }
                })
                    .then(me => {
                        const tokenObj = {
                            ...res.data,
                            userId: me.data.id,
                            username: me.data.username,
                            discriminator: me.data.discriminator
                        };
                        this.updateTokenAPI(tokenObj);
                    });
            });
    }

    updateTokenAPI(tokenObj) {
        Axios.post('/api/token/update', tokenObj)
            .then(() => {
                cookies.set('syxbot', {
                    username: tokenObj.username,
                    discriminator: tokenObj.discriminator,
                    id: tokenObj.userId,
                    token_type: tokenObj.token_type,
                    expire_at: (Date.now() / 1000) + tokenObj.expires_in
                });
                setTimeout(() => {
                    window.location.href = Config.OAuth.redirect_url;
                }, 1000);
            });
    }

    disconnect() {
        Axios.post('/api/token/remove', { userId: this.state.user.id })
            .then(remove => {
                if (remove) {
                    cookies.remove('syxbot');
                    this.setState({
                        user: false
                    });
                    this.generateRandomString();
                }
            });
    }

    generateRandomString() {
        const rand = Math.floor(Math.random() * 10);
        let randStr = '';

        for (let i = 0; i < 20 + rand; i++) {
            randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }
        randStr = encodeURIComponent(randStr);
        this.setState({
            randStr: randStr
        });
        localStorage.setItem('stateParameter', randStr);
    }

    render() {
        if (this.state && (this.state.randStr || this.state.user)) {
            return (
                <div className='website-container'>
                    <Navbar
                        randStr={this.state.randStr}
                        user={this.state.user}
                        disconnect={this.disconnect}
                    />
                </div>
            );
        }
        else {
            return (
                <table className='loading-table'>
                    <tbody>
                        <tr>
                            <td className='align-middle loading-td'>
                                <h1>Chargement</h1>
                                <div className='custom-spinner' />
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
    }
}
