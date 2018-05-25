import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import ReactPaginate from 'react-paginate'
import {withRouter} from 'react-router-dom'
import Route from './Route'

class Explorer extends PureComponent {
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    routes: PropTypes.array
  }
  state = {
    search: null,
    title: null,
    page: 0
  }
  redirect = (values = {}) => {
    const queryParams = new URLSearchParams(this.props.location.search)
    Object.keys(values).forEach(key => {
      queryParams.set(key, values[key])
    })
    const search = queryParams.toString()
    this.props.history.push({
      pathname: '/',
      search: search ? `?${search}` : ''
    })
  }
  render () {
    const queryParams = new URLSearchParams(this.props.location.search)
    const search = queryParams.get('q') || ''
    const page = Number(queryParams.get('page')) || 0
    let routes = this.props.routes.filter(route => {
      const searchString = `${route.path} ${route.title} ${route.description}`
      return search ? searchString.includes(search) : true
    })
    const numberPerPage = 20
    const pageCount = Math.ceil(routes.length / numberPerPage)
    const begin = (page * numberPerPage)
    const end = begin + numberPerPage
    routes.sort((a, b) => {
      if (a.path < b.path) return -1
      if (a.path > b.path) return 1
      return 0
    })
    routes = routes.slice(begin, end)
    return (
      <div>
        <div className='input-group mb-3'>
          <input
            type='text'
            value={search || ''}
            onChange={(e) => {
              this.redirect({
                q: e.target.value,
                page: 0
              })
            }}
            className='form-control'
            placeholder='Search'
          />
          <div className='input-group-append'>
            <button
              className='btn btn-secondary'
              type='button'
              onClick={() => {
                this.redirect({
                  q: '',
                  page: 0
                })
              }}
            >&times;</button>
          </div>
        </div>
        {routes.map((route, i) => (
          <div key={i} className={'mb-2'}>
            <Route key={i} route={route} />
          </div>
        ))}
        <div className='text-center' id={'react-paginate'}>
          <ReactPaginate
            previousLabel='Prev'
            nextLabel='Next'
            initialPage={page}
            forcePage={page}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={2}
            onPageChange={({selected}) => {
              this.redirect({page: selected})
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

export default withRouter(Explorer)