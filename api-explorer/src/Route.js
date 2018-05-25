import React, {Component} from 'react'
import PropTypes from 'prop-types'
import pathToRegexp from 'path-to-regexp'
import axios from 'axios'
import moment from 'moment'
import RequestForm from './RequestForm'
import config from './config'
import {Link, withRouter} from 'react-router-dom'

function StatusBadge ({status}) {
  status = String(status)
  const leadingNumber = status.substr(0, 1)
  let className = 'badge-secondary'
  if (leadingNumber === '2') className = 'badge-success'
  if (leadingNumber === '3') className = 'badge-dark'
  if (leadingNumber === '4') className = 'badge-warning'
  if (leadingNumber === '5') className = 'badge-danger'

  return <span className={`badge ${className}`}>{status}</span>
}
StatusBadge.propTypes = {
  status: PropTypes.number
}

class Route extends Component {
  static propTypes = {
    route: PropTypes.object,
    location: PropTypes.object
  }
  state = {
    method: null,
    params: {},
    response: null,
    payload: null,
    requestPath: null,
    requestStatus: null,
    expanded: false,
    sending: false
  }
  componentDidMount () {
    this.init()
  }
  componentDidUpdate (prevProps) {
    if (prevProps.route !== this.props.route) {
      this.init()
    }
  }
  init = () => {
    const methods = this.availableMethods()
    this.setState({
      method: methods[0],
      params: {},
      query: {},
      response: null,
      payload: this.props.route.payload ? JSON.stringify(this.props.route.payload || '', null, 4) : '',
      requestPath: null,
      requestStatus: null,
      expanded: this.props.location.pathname.includes('/request/'),
      sending: false
    })
  }
  availableMethods = () => {
    return ['get', 'post', 'put', 'delete'].filter(m => {
      return Object.keys(this.props.route.methods).includes(m)
    })
  }
  request = () => {
    const method = this.state.method
    const {route} = this.props
    const toPath = pathToRegexp.compile(route.path)
    let path = null
    try {
      path = toPath(this.state.params)
    } catch (e) {
      window.alert(e)
      return
    }
    let payload
    if (['post', 'put'].includes(method) && this.state.payload) {
      try {
        payload = JSON.parse(this.state.payload)
      } catch (e) {
        window.alert('Invalid json')
        return
      }
    }
    const queryParams = new URLSearchParams()
    Object.keys(this.state.query)
      .filter(q => this.state.query[q])
      .forEach(q => {
        queryParams.set(q, this.state.query[q])
      })
    const queryString = queryParams.toString()
    path = `${path}${queryString && `?${queryString}`}`
    this.setState({requestPath: path, sending: true})
    axios[method](`${config.api}${path}`, payload).then(res => {
      this.setState({
        response: res.data,
        requestStatus: res.status,
        sending: false
      })
    })
      .catch(error => {
        this.setState({
          response: error.response.data,
          requestStatus: error.response.status,
          sending: false
        })
      })
  }
  render () {
    const {route} = this.props
    let urlParams = []
    pathToRegexp(route.path, urlParams)
    let response = null
    try {
      if (this.state.response) {
        response = JSON.stringify(this.state.response, null, 4)
      }
    } catch (e) {
      response = this.state.response
    }
    return (
      <div className='card'>
        <div className='card-body' style={{paddingBottom: '.75rem', paddingTop: '1rem'}}>
          <div className={`row ${this.state.expanded && 'mb-2'}`}>
            <div className='col'>
              <a onClick={() => this.setState({expanded: !this.state.expanded})} style={{cursor: 'pointer'}}>
                <h6
                  className={`card-subtitle text-muted`}
                  style={{marginTop: 0}}
                >
                  <span className={'mr-1'} style={{fontWeight: 100}}>
                    {this.availableMethods().map(m => m.toUpperCase()).join('|')}
                  </span>
                  {route.path}
                </h6>
              </a>
            </div>
            <div className='col text-right'>
              <Link to={`/request/${route.id}`}>
                <span className='oi oi-link-intact' />
              </Link>
            </div>
          </div>
          {this.state.expanded && (
            <div>
              {route.title && (
                <h5 className='card-title'>
                  {route.title || route.path}
                </h5>
              )}
              {route.description && (
                <p className='card-text'>
                  {route.description}
                </p>
              )}
              <div className={'text-left'}>
                <hr />
                <RequestForm
                  route={route}
                  availableMethods={this.availableMethods()}
                  params={urlParams}
                  paramValues={this.state.params}
                  onParamChange={(param, value) => {
                    this.setState({
                      params: {
                        ...this.state.params,
                        [param]: value
                      }
                    })
                  }}
                  queryValues={this.state.query}
                  onQueryChange={(param, value) => {
                    this.setState({
                      query: {
                        ...this.state.query,
                        [param]: value
                      }
                    })
                  }}
                  payload={this.state.payload}
                  onPayloadChange={payload => this.setState({payload})}
                  method={this.state.method}
                  onMethodChange={method => this.setState({method, response: null})}
                  onSubmit={this.request}
                  sending={this.state.sending}
                />
              </div>
              <div>
                {response && (
                  <div>
                    <div className='row mt-4'>
                      <div className='col col-11'>
                        <StatusBadge status={this.state.requestStatus} /> {this.state.requestPath}
                      </div>
                      <div className='col col-1 text-right'>
                        <button className={'btn btn-sm btn-primary'} onClick={() => this.setState({response: null})}>
                          x
                        </button>
                      </div>
                    </div>
                    <pre className={'border mt-2 bg-light'} style={{padding: '1rem'}}>
                      <code>
                        {response}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
              {route.filename && (
                <p className={'card-text text-right mr-1 text-muted'}>
                  <small>{route.filename} - {moment(route.modified).local().format('M-D-YYYY h:mm a')}</small>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default withRouter(Route)
