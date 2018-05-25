import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

export default class RequestForm extends PureComponent {
  static propTypes = {
    route: PropTypes.object,
    onSubmit: PropTypes.func,
    params: PropTypes.array,
    paramValues: PropTypes.object,
    queryValues: PropTypes.object,
    payload: PropTypes.string,
    method: PropTypes.string,
    availableMethods: PropTypes.array,
    onParamChange: PropTypes.func,
    onQueryChange: PropTypes.func,
    onMethodChange: PropTypes.func,
    onPayloadChange: PropTypes.func,
    sending: PropTypes.bool
  }
  onSubmit = e => {
    e.preventDefault()
    this.props.onSubmit()
  }
  getHelp = (params, name) => {
    return params[name] ? (params[name].help || '') : ''
  }
  render () {
    const {
      route,
      params,
      paramValues,
      payload,
      method,
      availableMethods,
      queryValues
    } = this.props
    const paramDesc = route.params || {}
    const queryParams = Object.keys(route.query || {}).sort()
    const queryDesc = route.query || {}
    return (
      <form onSubmit={this.onSubmit}>
        <div className='row'>
          {params.length > 0 && (
            <div className='col'>
              <h6>URL Params</h6>
              {params.map(param => (
                <div key={param.name} className='form-group'>
                  <label>{param.name}</label>
                  <input
                    className='form-control'
                    value={paramValues[param.name] || ''}
                    onChange={e => this.props.onParamChange(param.name, e.target.value)}
                  />
                  {this.getHelp(paramDesc, param.name) && (
                    <small>{this.getHelp(paramDesc, param.name)}</small>
                  )}
                </div>
              ))}
            </div>
          )}
          {queryParams.length > 0 && (
            <div className='col'>
              <h6>Query Params</h6>
              {queryParams.map(param => (
                <div key={param} className='form-group'>
                  <label>{param}</label>
                  <input
                    className='form-control'
                    value={queryValues[param] || ''}
                    onChange={e => this.props.onQueryChange(param, e.target.value)}
                  />
                  {this.getHelp(queryDesc, param) && (
                    <small>{this.getHelp(queryDesc, param)}</small>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='form-group'>
          <label>Method</label>
          <select
            className='form-control form-control-sm col-2'
            value={method || ''}
            onChange={e => this.props.onMethodChange(e.target.value)}
            disabled={availableMethods.length <= 1}
          >
            {availableMethods.map(m => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
        </div>
        {['post', 'put'].includes(method) && (
          <div className='form-group'>
            <label>Payload</label>
            <textarea
              className='form-control'
              placeholder='Payload'
              value={payload || ''}
              onChange={e => this.props.onPayloadChange(e.target.value)}
            />
          </div>
        )}
        <div className={'text-left'}>
          <button type='submit' className={'btn btn-sm btn-primary'} disabled={this.props.sending}>
            {this.props.sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    )
  }
}
