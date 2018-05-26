import fs from 'fs'
import path from 'path'
import express from 'express'
import glob from 'glob'

export default function (app, options) {
  const fileRoutes = []
  if (options.routes) {
    // find all route files
    glob.sync(`${options.routes}/**/*.+(js|json)`).forEach(file => {
      const filename = file
      const required = require(filename)
      const route = required.default || required
      route.filename = filename
      route.methods = route.methods.map(method => method.toLowerCase())
      route.lastModified = fs.statSync(filename).mtime
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
          payload: routeFile.payload
        }
      })
      .filter(r => !['/_api', '/_docs', '*'].includes(r.path))

    return res.json({
      routes: cleaned,
      title: options.title
    })
  })

  // server the api explorer
  app.use('/_docs', express.static(path.resolve(__dirname, '..', 'api-explorer-dist')))

  // fallback to serve the api explorer so /_docs/request/* will work
  app.get('*', function (req, res) {
    res.sendFile(path.resolve(__dirname, '..', 'api-explorer-dist', 'index.html'))
  })
}
