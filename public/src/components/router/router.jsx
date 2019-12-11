"use strict"

import React from 'react';
import Docs from './../docs/docs.jsx'

export default class Router extends React.Component {

    constructor() {
        super()
        this.state = {
            page: null
        }
    }

    componentWillMount() {
        const url = window.location.href.split('/');
        const page = url[3] === '' || url[3] === '//' ? '/' : url[3];
        const page_arg = url[4] ? url[4] : '';
        if (page === 'docs') {
            this.setState({
                page: <Docs />
            })
        }
        console.log('page : ', page)
        console.log('page 2 : ', page_arg)
    }

    render() {
        return (
            this.state.page
        )
    }
}