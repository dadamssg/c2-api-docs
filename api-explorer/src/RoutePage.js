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
    if (!route) {
      return <div className={'text-center'}>No route found...</div>
    }
    return (
      <Route route={route} />
    )
  }
}

export default withRouter(RoutePage)
