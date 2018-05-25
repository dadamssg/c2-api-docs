import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import axios from 'axios'
import Explorer from './Explorer'
import config from './config'
import RoutePage from './RoutePage'

export function normalizeParams (params = {}) {
  const newParams = {}
  Object.keys(params).forEach(key => {
    const isObject = typeof params[key] === 'object'
    newParams[key] = {
      name: key,
      value: isObject ? params[key].value : (params[key] || ''),
      help: isObject ? params[key].help : ''
    }
  })
  return newParams
}

class App extends Component {
  state = {
    routes: []
  }
  componentDidMount () {
    axios.get(`${config.api}/_api`).then(res => {
      const routes = res.data.routes.map(r => {
        const id = window.btoa(`${r.path}-${Object.keys(r.methods).join('-')}`)
        return {
          ...r,
          id,
          params: normalizeParams(r.params),
          query: normalizeParams(r.query)
        }
      })
      this.setState({
        ...res.data,
        routes
      })
    })
  }
  render () {
    return (
      <Router basename={config.env === 'production' ? '/_docs/' : undefined}>
        <div className={'container mt-5'}>
          <Link id='app-title' to={'/'}><h1>{this.state.title || 'C2 API Docs'}</h1></Link>
          <Route exact path='/' render={() => <Explorer routes={this.state.routes} />} />
          <Route path='/request/:id' component={() => <RoutePage routes={this.state.routes} />} />
        </div>
      </Router>
    )
  }
}

export default hot(module)(App)
