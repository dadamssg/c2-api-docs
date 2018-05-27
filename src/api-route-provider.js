import fs from 'fs'
import path from 'path'
import express from 'express'
import glob from 'glob'
import childProcess from 'child_process'
const {execSync} = childProcess

export default function (app, options) {
  const fileRoutes = []
  if (options.routes) {
    // find all route files
    glob.sync(`${options.routes}/**/*.+(js|json)`).forEach(file => {
      const filename = file
      const required = require(filename)
      const route = required.default || required
      route.filename = filename
      const methods = route.method ? [route.method] : route.methods
      route.methods = methods.map(method => method.toLowerCase())
      route.lastModified = fs.statSync(filename).mtime
      route.pathUsage = ''
      try {
        route.pathUsage = options.src ? execSync(`grep -rn '${route.path}' ${options.src}`).toString() : ''
      } catch (e) {}
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

        return {
          path: r.path,
          methods: r.methods,
          title: routeFile.title,
          description: routeFile.description,
          query: routeFile.query,
          params: routeFile.params,
          filename: routeFile.filename,
          modified: routeFile.lastModified,
          payload: routeFile.payload,
          pathUsage: routeFile.pathUsage
        }
      })
      .filter(r => !['/_api', '/_docs', '/_path', '*'].includes(r.path))

    return res.json({
      routes: cleaned,
      title: options.title
    })
  })

  // find path info in project files
  app.get('/_path', (req, res) => {
    const path = req.query.path
    if (!path) {
      return res.status(400).json({error: 'No path query param.'})
    }

    // find references in src files
    const srcFiles = []
    if (options.src) {
      const parts = path.split('/')
      let pattern = parts
        .map((p, i) => {
          if (p.includes(':')) return '[\\s\\S]*'
          if ((i + 1) === parts.length) return `${p}*`
          return p
        })
        .join('\\/')
      pattern = `(${pattern})\\w+`
      pattern = new RegExp(pattern)
      glob.sync(`${options.src}/**/*.js`).forEach(file => {
        const content = String(fs.readFileSync(file))
        const lines = content.split('\n')
        lines.forEach((line, i) => {
          const result = pattern.exec(line)
          if (result && result.length > 0) {
            const lineNo = i + 1
            const startLine = lineNo - 3 <= 1 ? 1 : lineNo
            const linesCopy = [...lines]
            srcFiles.push({
              file,
              lastModified: fs.statSync(file).mtime,
              lineNo,
              lines: linesCopy
                .splice(startLine - 1, 5)
                .map((line, x) => `${startLine + x}. ${line}`)
            })
          }
        })
      })
    }

    // find references in mock server files
    const serverFiles = {}
    if (options.server) {
      glob.sync(`${options.server}/**/*.js`).forEach(file => {
        const content = String(fs.readFileSync(file))
        String(content).split('\n').forEach((line, i) => {
          if (line.includes(path)) {
            serverFiles[`${file}:${i + 1}`] = fs.statSync(file).mtime
          }
        })
      })
    }

    return res.json({
      path,
      src: srcFiles,
      server: serverFiles
    })
  })

  // serve the api explorer
  app.use('/_docs', express.static(path.resolve(__dirname, '..', 'api-explorer-dist')))

  // fallback to serve the api explorer so /_docs/request/* will work
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '..', 'api-explorer-dist', 'index.html'))
  })
}
