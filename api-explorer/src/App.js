import React, {Component} from 'react'
import {hot} from 'react-hot-loader'
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import axios from 'axios'
import Explorer from './Explorer'
import config from './config'
import RoutePage from './RoutePage'
import {buildRouteSearchString, normalizeParams} from './utils'

const defaultTitle = 'API Docs'

class App extends Component {
  state = {
    routes: []
  }
  componentDidMount () {
    axios.get(`${config.api}/_api`).then(res => {
      if (res.data.title) {
        document.title = res.data.title
      }
      const routes = res.data.routes.map(r => {
        return {
          ...r,
          params: normalizeParams(r.params),
          query: normalizeParams(r.query),
          search: buildRouteSearchString(r)
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
          <Link id='app-title' to={'/'}><h1>{this.state.title || defaultTitle}</h1></Link>
          <Route exact path='/' render={() => <Explorer routes={this.state.routes} />} />
          <Route path='/request/:id' component={() => <RoutePage routes={this.state.routes} />} />
        </div>
      </Router>
    )
  }
}

export default hot(module)(App)
