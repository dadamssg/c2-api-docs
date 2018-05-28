import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import _ from 'lodash'
import config from './config'
import SourceReference from './SourceReference'
import ServerReference from './ServerReference'

export default class PathReferences extends PureComponent {
  static propTypes = {
    path: PropTypes.string.isRequired,
    methods: PropTypes.object,
    route: PropTypes.object
  }
  state = {
    src: [],
    server: [],
    loading: false
  }
  componentDidMount () {
    this.fetchData()
  }
  componentDidUpdate (prevProps) {
    if (this.props.route !== prevProps.route) {
      this.fetchData()
    }
  }
  fetchData = () => {
    const path = encodeURIComponent(this.props.route.path)
    const methods = encodeURIComponent(Object.keys(this.props.route.methods))
    axios.get(`${config.api}/_path?path=${path}&methods=${methods}`).then(res => {
      this.setState({
        loading: false,
        src: res.data.src || [],
        server: res.data.server || {}
      })
    })
      .catch(() => {})
  }
  render () {
    const {route} = this.props
    const srcFiles = this.state.src || []
    const serverFiles = this.state.server || []
    const uid = route.id.replace(/[^a-z0-9]/gi, '')
    return (
      <div>
        {srcFiles.length > 0 && (
          <div className='accordion' id='accordion'>
            {srcFiles.map((file, i) => (
              <SourceReference
                key={`${uid}-${i}`}
                id={`${uid}-${i}`}
                reference={file}
              />
            ))}
          </div>
        )}
        {route.filename && (
          <div className='mt-3'>
            <ServerReference file={route.filename} modified={route.modified} />
          </div>
        )}
        {!route.filename && serverFiles.length > 0 && (
          <div className='mt-3'>
            {serverFiles.map((file, i) => (
              <ServerReference
                key={i}
                file={`${file.file}:${file.lineNo}`}
                modified={file.lastModified}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}
