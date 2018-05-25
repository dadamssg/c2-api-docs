import React from 'react'
import {hot} from 'react-hot-loader'

import Explorer from './Explorer'

function App () {
  return (
    <div>
      <div className={'container mt-5'}>
        <Explorer/>
      </div>
    </div>
  )
}

export default hot(module)(App)