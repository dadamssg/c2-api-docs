import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/prism-light'
import jsx from 'react-syntax-highlighter/languages/prism/jsx'
import prism from 'react-syntax-highlighter/styles/prism/coy'
import {cleanFilename, displayDate} from './utils'

registerLanguage('jsx', jsx)

export default class SourceReference extends PureComponent {
  static propTypes = {
    id: PropTypes.string,
    reference: PropTypes.object,
    hidePath: PropTypes.string
  }
  render () {
    const {id, reference, hidePath} = this.props
    if (!reference) return null
    const headingId = `heading-${id}`
    const collapseId = `collapse-${id}`
    const lineNumbers = typeof reference.lineNo === 'number' ? [reference.lineNo] : reference.lineNos
    const filename = cleanFilename(`${reference.file.replace(hidePath, '')}:{lineNumbers.join(',')`)

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
              {filename}
            </button>
          </span>
        </div>

        <div id={collapseId} className='collapse' aria-labelledby={headingId}>
          <div className='card-body border-bottom' style={{overflowX: 'scroll'}}>
            <SyntaxHighlighter
              language='jsx'
              style={prism}
              showLineNumbers
              startingLineNumber={reference.startLineNo}
              lineNumberStyle={no => ({color: lineNumbers.includes(no) ? '#007bff' : '#c8c8c8'})}
            >
              {reference.lines.join('\n')}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    )
  }
}