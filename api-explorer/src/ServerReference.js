import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {displayDate} from './utils'

export default class ServerReference extends PureComponent {
  static propTypes = {
    file: PropTypes.string,
    modified: PropTypes.string,
    hidePath: PropTypes.string
  }

  render () {
    const {file, modified, hidePath} = this.props
    return (
      <p className={'card-text mr-1 mb-0 text-muted'} title={displayDate(modified)}>
        <small>{file.replace(hidePath, '')}</small>
      </p>
    )
  }
}
