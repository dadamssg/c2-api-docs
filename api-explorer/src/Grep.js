import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import Search from './Search'
import axios from 'axios'
import Spinner from 'react-spinkit'
import config from './config'
import SourceReference from './SourceReference'

export default class Grep extends PureComponent {
  static propTypes = {
    loginId: PropTypes.string
  }
  state = {
    loading: false,
    search: '',
    files: [],
    searched: false
  }
  onSubmit = () => {
    const {search, loading} = this.state
    if (search.length === 0 || loading) return
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
                hidePath={''}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
}