import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import Route from './Route'

class RoutePage extends PureComponent {
  static propTypes = {
    routes: PropTypes.array,
    match: PropTypes.object
  }

  render () {
    const {match} = this.props
    const route = this.props.routes.find(r => r.id === match.params.id)
    return route
      ? <Route route={route} />
      : <div className={'text-center'}>No route found...</div>
  }
}

export default withRouter(RoutePage)
