'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
  var enterModule = require('react-hot-loader').enterModule;

  enterModule && enterModule(module);
})();

var _default = function _default(app, options) {
  var fileRoutes = [];
  _glob2.default.sync(options.dir + '/**/*.js').forEach(function (file) {
    var filename = file;
    var required = require(filename);
    var route = required.default || required;
    if (file.substr(-2) === 'js') {
      route.filename = filename;
      route.methods = route.methods.map(function (method) {
        return method.toLowerCase();
      });
      route.lastModified = _fs2.default.statSync(filename).mtime;
      fileRoutes.push(route);
      var appRoute = app.route(route.path);
      route.methods.forEach(function (method) {
        appRoute[method](route.response);
      });
    }
  });

  app.get('/_api', function (req, res) {
    var routes = [];

    app._router.stack.forEach(function (middleware) {
      if (middleware.route) {
        // routes registered directly on the app
        routes.push(middleware.route);
      } else if (middleware.name === 'router') {
        // router middleware
        middleware.handle.stack.forEach(function (handler) {
          if (handler.route) routes.push(handler.route);
        });
      }
    });

    var cleaned = routes.map(function (r) {
      var fileRoute = fileRoutes.find(function (route) {
        var methods = Object.keys(r.methods).filter(function (method) {
          return r.methods[method];
        });
        var methodMatch = methods.filter(function (n) {
          return route.methods.indexOf(n) !== -1;
        }).length;
        return methodMatch && route.path === r.path;
      }) || {};

      return {
        path: r.path,
        methods: r.methods,
        title: fileRoute.title,
        description: fileRoute.description,
        query: fileRoute.query,
        params: fileRoute.params,
        filename: fileRoute.filename,
        modified: fileRoute.lastModified,
        payload: fileRoute.payload
      };
    }).filter(function (r) {
      return !['/_api', '/_docs'].includes(r.path);
    });
    return res.json({
      routes: cleaned,
      title: options.title
    });
  });

  app.use('/_docs', _express2.default.static(_path2.default.resolve(__dirname, '../', 'api-explorer-dist')));
};

exports.default = _default;
;

(function () {
  var reactHotLoader = require('react-hot-loader').default;

  var leaveModule = require('react-hot-loader').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(_default, 'default', 'src/api-route-provider.js');
  leaveModule(module);
})();

;