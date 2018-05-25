import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import config from './config'
import 'open-iconic/font/css/open-iconic-bootstrap.css'
import './app.css'

console.log(config) // eslint-disable-line

const appElement = document.getElementById('app-root')

ReactDOM.render(<App />, appElement)
