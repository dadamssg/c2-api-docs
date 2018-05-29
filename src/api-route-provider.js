import fs from 'fs'
import path from 'path'
import express from 'express'
import glob from 'glob'
import childProcess from 'child_process'
const {execSync} = childProcess

export default function (app, options = {}) {
  const fileRoutes = []
  if (options.routes) {
    // find all route files
    glob.sync(`${options.routes}/**/*.+(js|json)`).forEach(file => {
      // ignore files that start with _ as a means to allow for fixture files
      if (path.basename(file).substr(0, 1) === '_') return
      const filename = file
      const required = require(filename)
      const route = required.default || required
      route.filename = filename
      const methods = route.method ? [route.method] : route.methods
      route.methods = methods.map(method => method.toLowerCase())
      route.lastModified = getLastModified(filename)
      fileRoutes.push(route)
      // create express route
      const appRoute = app.route(route.path)
      // add methods to route
      route.methods.forEach(method => {
        if (typeof route.response === 'function') {
          appRoute[method](route.response)
        } else {
          appRoute[method]((req, res) => res.json(route.response))
        }
      })
    })
  }

  app.get('/_api', (req, res) => {
    const routes = []
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // routes registered directly on the app
        routes.push(middleware.route)
      } else if (middleware.name === 'router') {
        // router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) routes.push(handler.route)
        })
      }
    })

    const cleaned = routes
      .map(r => {
        // attempt to find route file for route
        const routeFile = fileRoutes.find(route => {
          const methods = Object.keys(r.methods).filter(method => r.methods[method])
          const methodMatch = methods.filter(n => {
            return route.methods.indexOf(n) !== -1
          }).length
          return methodMatch && route.path === r.path
        }) || {}
        const methods = Object.keys(r.methods).join('-')
        const id = Buffer.from(`${methods}-${r.path}`).toString('base64')
        return {
          id,
          path: r.path,
          methods: r.methods,
          title: routeFile.title,
          description: routeFile.description,
          query: routeFile.query,
          params: routeFile.params,
          filename: routeFile.filename,
          lastModified: routeFile.lastModified,
          payload: routeFile.payload
        }
      })
      .filter(r => !['/_api', '/_docs', '/_path', '*'].includes(r.path))

    return res.json({
      routes: cleaned,
      title: options.title,
      description: options.description,
      hidePath: options.hidePath
    })
  })

  app.get('/_path', (req, res) => {
    const {path} = req.query
    if (!path) {
      return res.status(400).json({error: 'No path query param.'})
    }
    // determine how many lines of code to show
    let showLines = Number(req.query.lines)
    if (isNaN(showLines) || showLines < 10) {
      showLines = 10
    }
    const halfLines = Math.ceil(showLines / 2) - 1
    const serverDirs = dirsToArray(options.server)
    const files = findPathInSrc(options, path).filter(test => {
      // filter out any server files
      return !serverDirs.some(dir => test.file.includes(dir))
    })
    const pattern = createSrcPathRegExp(path)
    let srcFiles = []
    files.forEach(test => {
      const {file, lineNo} = test
      const content = String(fs.readFileSync(file))
      const lines = content.split('\n')
      const line = lines[lineNo - 1] || ''
      const result = pattern.exec(line)
      if (result && result.length > 0) {
        const startLine = lineNo - halfLines <= 1 ? 1 : lineNo - halfLines // start halfLines lines back
        const linesCopy = [...lines]
        srcFiles.push({
          file,
          lastModified: getLastModified(file),
          startLineNo: startLine,
          lineNo,
          lines: linesCopy.splice(startLine - 1, showLines)
        })
      }
    })

    return res.json({
      path,
      src: srcFiles,
      server: findPathInServer(options, path)
    })
  })

  // serve the api explorer
  app.use('/_docs', express.static(path.resolve(__dirname, '..', 'api-explorer-dist')))

  // fallback to serve the api explorer so /_docs/request/* will work
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '..', 'api-explorer-dist', 'index.html'))
  })
}

function getLastModified (file) {
  try {
    return String(execSync(`git log -1 --date=iso --format=%cD ${file}`)).trim()
  } catch (e) {
    return fs.statSync(file).mtime
  }
}

function dirsToArray (dirs) {
  return (Array.isArray(dirs) ? dirs : [dirs]).filter(d => !!d)
}

/**
 * Uses grep to find js/json files/lines with all non variable path parts in line
 *
 * @param options
 * @param path
 * @returns Array
 */
function findPathInSrc (options, path) {
  // coalesce array of src dirs
  const srcDirs = dirsToArray(options.src)
  if (srcDirs.length === 0) {
    return []
  }
  // get non variable path parts
  const parts = path
    .split('/')
    .filter(p => {
      return !!p && !p.includes(':')
    })
  // no parts to search
  if (parts.length === 0) {
    return []
  }
  const files = {}
  srcDirs.forEach(dir => {
    // build grep search
    const [first, ...rest] = parts
    const partsPattern = [`grep -rn --include=\\*.js --include=\\*.json '${first}' ${dir}`]
    rest.forEach(p => partsPattern.push(`grep '${p}'`))
    const search = partsPattern.join(' | ')
    // execute, convert to array, filter blanks
    let searchResult = ''
    try {
      searchResult = String(execSync(search))
    } catch (e) {
      searchResult = ''
    }
    searchResult.split('\n').filter(l => !!l).forEach(result => {
      const firstColon = nthIndex(result, ':', 1)
      const secondColon = nthIndex(result, ':', 2)
      const file = result.substr(0, firstColon)
      const lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)))
      files[`${file}:${lineNo}`] = {file, lineNo}
    })
  })
  // convert to array of objects
  return Object.keys(files).sort().map(key => files[key])
}

function findPathInServer (options, path) {
  // coalesce array of server dirs
  const dirs = dirsToArray(options.server)
  if (dirs.length === 0) {
    return []
  }
  const files = {}
  dirs.forEach(dir => {
    let searchResult = ''
    try {
      searchResult = String(execSync(`grep -rn --include=\\*.js --include=\\*.json '${path}' ${dir}`))
    } catch (e) {
      searchResult = ''
    }
    searchResult.split('\n').filter(l => !!l).forEach(result => {
      const firstColon = nthIndex(result, ':', 1)
      const secondColon = nthIndex(result, ':', 2)
      const file = result.substr(0, firstColon)
      const lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)))
      files[`${file}:${lineNo}`] = {
        file,
        lineNo,
        lastModified: getLastModified(file)
      }
    })
  })
  // convert to array of objects
  return Object.keys(files).sort().map(key => files[key])
}

function createSrcPathRegExp (path) {
  const parts = path.split('/')
  let pattern = parts
    .map((p, i) => {
      if (p.includes(':')) return '[\\s\\S]*'
      if ((i + 1) === parts.length) return `${p}*`
      return p
    })
    .join('\\/')
  pattern = `(${pattern})\\w+`
  return new RegExp(pattern)
}

function nthIndex (str, pat, n) {
  const L = str.length
  let i = -1
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i)
    if (i < 0) break
  }
  return i
}
