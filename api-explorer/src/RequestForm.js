import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

export default class RequestForm extends PureComponent {
  static propTypes = {
    route: PropTypes.object,
    onSubmit: PropTypes.func,
    params: PropTypes.array,
    paramValues: PropTypes.object,
    payload: PropTypes.string,
    method: PropTypes.string,
    availableMethods: PropTypes.array,
    onParamChange: PropTypes.func,
    onMethodChange: PropTypes.func,
    onPayloadChange: PropTypes.func,
    sending: PropTypes.bool
  }
  onSubmit = e => {
    e.preventDefault()
    this.props.onSubmit()
  }
  render () {
    const {
      params,
      paramValues,
      payload,
      method,
      availableMethods
    } = this.props
    return (
      <form onSubmit={this.onSubmit}>
        {params.length > 0 && (
          <div className='row'>
            <div className='col'>
              <h6>URL Params</h6>
              {params.map(param => (
                <div key={param.name} className='form-group'>
                  <label>{param.name}</label>
                  <input
                    className='form-control col-2'
                    placeholder={param.name}
                    value={paramValues[param.name] || ''}
                    onChange={e => this.props.onParamChange(param.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className='form-group'>
          <label>Method</label>
          <select
            className='form-control col-2'
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
