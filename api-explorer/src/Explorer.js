import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import ReactPaginate from 'react-paginate'
import Route from './Route'
import './page.css'
import config from './config'

export default class Explorer extends PureComponent {
  static propTypes = {
    loginId: PropTypes.string
  }
  state = {
    routes: [],
    search: null,
    title: null,
    page: 0
  }
  componentDidMount () {
    axios.get(`${config.api}/_api`).then(res => {
      this.setState(res.data)
    })
  }
  render () {
    let routes = this.state.routes.filter(route => {
      const searchString = `${route.path} ${route.title} ${route.description}`
      return this.state.search ? searchString.includes(this.state.search) : true
    })
    const numberPerPage = 20
    const pageCount = Math.ceil(routes.length / numberPerPage)
    const begin = (this.state.page * numberPerPage)
    const end = begin + numberPerPage
    routes.sort((a, b) => {
      if (a.path < b.path) return -1
      if (a.path > b.path) return 1
      return 0
    })
    routes = routes.slice(begin, end)
    return (
      <div>
        <h1>{this.state.title || 'C2 API Docs'}</h1>
        <div className='input-group mb-3'>
          <input
            type='text'
            value={this.state.search || ''}
            onChange={(e) => this.setState({search: e.target.value, page: 0})}
            className='form-control'
            placeholder='Search'
          />
          <div className='input-group-append'>
            <button
              className='btn btn-secondary'
              type='button'
              onClick={() => this.setState({search: null})}
            >&times;</button>
          </div>
        </div>
        {routes.map((route, i) => (
          <div key={i} className={'mb-2'}>
            <Route route={route} />
          </div>
        ))}
        <div className='text-center' id={'react-paginate'}>
          <ReactPaginate
            previousLabel='Prev'
            nextLabel='Next'
            initialPage={this.state.page}
            forcePage={this.state.page}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            onPageChange={({selected}) => {
              this.setState({page: selected})
            }}
            containerClassName={`pagination ${pageCount <= 1 ? 'hidden' : ''}`}
            subContainerClassName='pages pagination'
            activeClassName='active'
            breakClassName='page-item'
            breakLabel={<a className='page-link'>...</a>}
            pageClassName='page-item'
            previousClassName='page-item'
            nextClassName='page-item'
            pageLinkClassName='page-link'
            previousLinkClassName='page-link'
            nextLinkClassName='page-link'
          />
        </div>
      </div>
    )
  }
}
