import React from 'react'
import PropTypes from 'prop-types'
import MarkdownIt from 'markdown-it'
import SyntaxHighlighter, {registerLanguage} from 'react-syntax-highlighter/prism-light'
import jsx from 'react-syntax-highlighter/languages/prism/jsx'
import js from 'react-syntax-highlighter/languages/prism/javascript'
import json from 'react-syntax-highlighter/languages/prism/json'
import prism from 'react-syntax-highlighter/styles/prism/coy'
import ReactDOMServer from 'react-dom/server'
registerLanguage('jsx', jsx)
registerLanguage('js', js)
registerLanguage('json', json)

const markdown = MarkdownIt({
  highlight: function (str, lang) {
    const code = (
      <SyntaxHighlighter
        language={lang}
        style={prism}
      >
        {str}
      </SyntaxHighlighter>
    )
    return `<div class="border px-3 pt-2 pb-0">${ReactDOMServer.renderToStaticMarkup(code)}</div>`
  }
})

export default function Markdown ({children}) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: markdown.render(children)
      }}
    />
  )
}

Markdown.propTypes = {children: PropTypes.string}
