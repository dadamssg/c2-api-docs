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
    const queryParams = new URLSearchParams(window.location.search)
    // remove search query when clicking home
    queryParams.set('q', '')
    queryParams.set('page', 1)
    return (
      <Router basename={config.env === 'production' ? '/_docs/' : undefined}>
        <div className={'container mt-5'} style={{marginBottom: '5rem'}}>
          <Link id='app-title' to={{pathname: '/', search: queryParams.toString()}}>
            <h1>{this.state.title || defaultTitle}</h1>
          </Link>
          <Route
            exact
            path='/'
            render={() => <Explorer routes={this.state.routes} hidePath={this.state.hidePath} />}
          />
          <Route
            path='/request/:id'
            component={() => <RoutePage routes={this.state.routes} hidePath={this.state.hidePath} />}
          />
        </div>
      </Router>
    )
  }
}

export default hot(module)(App)
