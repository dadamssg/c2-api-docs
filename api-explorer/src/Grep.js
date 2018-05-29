import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import Search from './Search'
import axios from 'axios'
import Spinner from 'react-spinkit'
import config from './config'
import SourceReference from './SourceReference'

export default class Grep extends PureComponent {
  static propTypes = {
    hidePath: PropTypes.string
  }
  state = {
    loading: false,
    search: '',
    files: [],
    searched: false
  }
  isDisabled = () => {
    const {search, loading} = this.state
    return search.length < 3 || loading
  }
  onSubmit = () => {
    if (this.isDisabled()) return
    this.setState({loading: true, error: null, files: []})
    const q = encodeURIComponent(this.state.search)
    axios.get(`${config.api}/_grep?q=${q}`).then(res => {
      this.setState({...res.data, loading: false, searched: true})
    }).catch(error => {
      this.setState({loading: false, error: error.response.data.error})
    })
  }
  render () {
    const {
      loading,
      search,
      searched,
      files,
      error
    } = this.state
    return (
      <div>
        <div className='mb-3'>
          <Search
            value={search}
            placeholder='grep'
            onChange={(e) => this.setState({search: e.target.value})}
            onSubmit={this.onSubmit}
            disabled={this.isDisabled()}
          />
        </div>
        {loading && (
          <div className='text-center mt-5'>
            <Spinner name='line-scale-pulse-out' fadeIn='quarter' />
          </div>
        )}
        {!loading && searched && files.length === 0 && !error && (
          <div className='text-center mt-5'>
            No luck...
          </div>
        )}
        {error && (
          <div className='text-center mt-5'>
            {error}
          </div>
        )}
        {!loading && files.length > 0 && (
          <div className='accordion' id='accordion'>
            {files.map((file, i) => (
              <SourceReference
                key={`file-${i}`}
                id={`file-${i}`}
                reference={file}
                hidePath={this.props.hidePath}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}