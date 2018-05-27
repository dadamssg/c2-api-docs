import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/prism-light'
import jsx from 'react-syntax-highlighter/languages/prism/jsx'
import prism from 'react-syntax-highlighter/styles/prism/prism'
import {displayDate} from './utils'

registerLanguage('jsx', jsx)

export default class SourceReference extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    reference: PropTypes.object
  }
  render () {
    const {id, reference} = this.props
    if (!reference) return null
    const headingId = `heading-${id}`
    const collapseId = `collapse-${id}`
    return (
      <div className='card'>
        <div
          className='card-header'
          id={headingId}
          style={{padding: '0rem'}}
          title={displayDate(reference.lastModified)}>
          <span className='mb-0'>
            <button
              className='btn btn-link'
              style={{fontSize: '.75rem'}}
              type='button'
              data-toggle='collapse'
              data-target={`#${collapseId}`}
              aria-controls={collapseId}>
              {reference.file}:{reference.lineNo}
            </button>
          </span>
        </div>

        <div id={collapseId} className='collapse' aria-labelledby={headingId} data-parent='#accordion'>
          <div className='card-body'>
            <SyntaxHighlighter
              language='jsx'
              style={prism}
              showLineNumbers
              startingLineNumber={reference.startLineNo}
            >
              {reference.lines.join('\n')}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    )
  }
}