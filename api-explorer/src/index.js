import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import config from './config'

console.log(config) // eslint-disable-line

const appElement = document.getElementById('app-root')

ReactDOM.render(<App />, appElement)
