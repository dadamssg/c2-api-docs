import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {Link, withRouter} from 'react-router-dom'
import {markdown} from 'markdown'
import Response from './Response'
import * as utils from './utils'
import RequestForm from './RequestForm'
import PathReferences from './PathReferences'

class Route extends Component {
  static propTypes = {
    route: PropTypes.object,
    location: PropTypes.object
  }
  state = {
    expanded: false
  }
  componentDidMount () {
    this.expandIfLinked()
  }
  componentDidUpdate (props) {
    if (props.route !== this.props.route) {
      this.expandIfLinked()
    }
  }
  expandIfLinked = () => {
    this.setState({
      expanded: this.props.location.pathname.includes('/request/')
    })
  }
  render () {
    const {route} = this.props
    return (
      <div className='card'>
        <div className='card-body' style={{paddingBottom: '.75rem', paddingTop: '1rem'}}>
          <div className={`row ${this.state.expanded && 'mb-2'}`}>
            <div className='col-11'>
              <a onClick={() => this.setState({expanded: !this.state.expanded})} style={{cursor: 'pointer'}}>
                <h6
                  className={`card-subtitle text-muted`}
                  style={{marginTop: 0}}
                >
                  <span className={'mr-1'} style={{fontWeight: 100}}>
                    {utils.getAvailableMethods(route).map(m => m.toUpperCase()).join('|')}
                  </span>
                  {route.path}
                </h6>
              </a>
            </div>
            <div className='col-1 text-right'>
              <Link to={`/request/${route.id}`}>
                <span className='oi oi-link-intact' />
              </Link>
            </div>
          </div>
          {this.state.expanded && (
            <Fragment>
              {route.title && (
                <h5 className='card-title'>
                  {route.title || route.path}
                </h5>
              )}
              {route.description && (
                <p
                  className='card-text'
                  dangerouslySetInnerHTML={{
                    __html: markdown.toHTML(route.description) || ''
                  }}
                />
              )}
              <div className={'text-left'}>
                <hr />
                <RequestForm
                  route={route}
                  setResponse={response => this.setState({response})}
                />
              </div>
              {this.state.response && (
                <Response
                  onRemove={() => this.setState({response: null})}
                  response={this.state.response}
                />
              )}
              <div className='mt-5'>
                <PathReferences route={route} path={route.path} methods={route.methods} />
              </div>
            </Fragment>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(Route)
