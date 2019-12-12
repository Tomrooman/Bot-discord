"use strict";

import React from 'react';
import Docs from './../docs/docs.jsx';

export default class Router extends React.Component {

    constructor() {
        super()
        this.state = {
            page: null
        }
    }

    componentDidMount() {
        const url = window.location.href.split('/');
        const page = url[3] === '' || url[3] === '//' ? '/' : url[3];
        const page_arg = url[4] ? url[4] : '';
        if (page && page.substr(0, 4) === 'docs') {
            this.setState({
                page: <Docs command={page_arg} />
            })
        }
    }

    render() {
        return (
            this.state.page
        )
    }
}