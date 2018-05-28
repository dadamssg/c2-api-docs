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

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
  var enterModule = require('react-hot-loader').enterModule;

  enterModule && enterModule(module);
})();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var execSync = _child_process2.default.execSync;

var _default = function _default(app, options) {
  var fileRoutes = [];
  if (options.routes) {
    // find all route files
    _glob2.default.sync(options.routes + '/**/*.+(js|json)').forEach(function (file) {
      var filename = file;
      var required = require(filename);
      var route = required.default || required;
      route.filename = filename;
      var methods = route.method ? [route.method] : route.methods;
      route.methods = methods.map(function (method) {
        return method.toLowerCase();
      });
      route.lastModified = _fs2.default.statSync(filename).mtime;
      route.pathUsage = '';
      try {
        route.pathUsage = options.src ? execSync('grep -rn \'' + route.path + '\' ' + options.src).toString() : '';
      } catch (e) {}
      fileRoutes.push(route);
      // create express route
      var appRoute = app.route(route.path);
      // add methods to route
      route.methods.forEach(function (method) {
        if (typeof route.response === 'function') {
          appRoute[method](route.response);
        } else {
          appRoute[method](function (req, res) {
            return res.json(route.response);
          });
        }
      });
    });
  }

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
      // attempt to find route file for route
      var routeFile = fileRoutes.find(function (route) {
        var methods = Object.keys(r.methods).filter(function (method) {
          return r.methods[method];
        });
        var methodMatch = methods.filter(function (n) {
          return route.methods.indexOf(n) !== -1;
        }).length;
        return methodMatch && route.path === r.path;
      }) || {};
      var methods = Object.keys(r.methods).join('-');
      var id = Buffer.from(methods + '-' + r.path).toString('base64');
      return {
        id: id,
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
      };
    }).filter(function (r) {
      return !['/_api', '/_docs', '/_path', '*'].includes(r.path);
    });

    return res.json({
      routes: cleaned,
      title: options.title
    });
  });

  app.get('/_path', function (req, res) {
    var path = req.query.path;
    if (!path) {
      return res.status(400).json({ error: 'No path query param.' });
    }
    var serverDirs = dirsToArray(options.server);
    var files = findPathInSrc(options, path).filter(function (test) {
      // filter out any server files
      return !serverDirs.some(function (dir) {
        return test.file.includes(dir);
      });
    });
    var pattern = createSrcPathRegExp(path);
    var srcFiles = [];
    files.forEach(function (test) {
      var file = test.file,
          lineNo = test.lineNo;

      var content = String(_fs2.default.readFileSync(file));
      var lines = content.split('\n');
      var line = lines[lineNo - 1] || '';
      var result = pattern.exec(line);
      if (result && result.length > 0) {
        var startLine = lineNo - 4 <= 1 ? 1 : lineNo - 4; // start 4 lines back
        var linesCopy = [].concat(_toConsumableArray(lines));
        srcFiles.push({
          file: file,
          lastModified: _fs2.default.statSync(file).mtime,
          startLineNo: startLine,
          lineNo: lineNo,
          lines: linesCopy.splice(startLine - 1, 10) // show 10 lines total
        });
      }
    });

    return res.json({
      path: path,
      src: srcFiles,
      server: findPathInServer(options, path)
    });
  });

  // serve the api explorer
  app.use('/_docs', _express2.default.static(_path2.default.resolve(__dirname, '..', 'api-explorer-dist')));

  // fallback to serve the api explorer so /_docs/request/* will work
  app.get('*', function (req, res) {
    res.sendFile(_path2.default.resolve(__dirname, '..', 'api-explorer-dist', 'index.html'));
  });
};

exports.default = _default;


function dirsToArray(dirs) {
  return (Array.isArray(dirs) ? dirs : [dirs]).filter(function (d) {
    return !!d;
  });
}

/**
 * Uses grep to find js/json files/lines with all non variable path parts in line
 *
 * @param options
 * @param path
 * @returns Array
 */
function findPathInSrc(options, path) {
  // coalesce array of src dirs
  var srcDirs = dirsToArray(options.src);
  if (srcDirs.length === 0) {
    return [];
  }
  // get non variable path parts
  var parts = path.split('/').filter(function (p) {
    return !!p && !p.includes(':');
  });
  // no parts to search
  if (parts.length === 0) {
    return [];
  }
  var files = {};
  srcDirs.forEach(function (dir) {
    // build grep search
    var _parts = _toArray(parts),
        first = _parts[0],
        rest = _parts.slice(1);

    var partsPattern = ['grep -rn --include=\\*.js --include=\\*.json \'' + first + '\' ' + dir];
    rest.forEach(function (p) {
      return partsPattern.push('grep \'' + p + '\'');
    });
    var search = partsPattern.join(' | ');
    // execute, convert to array, filter blanks
    var searchResult = '';
    try {
      searchResult = String(execSync(search));
    } catch (e) {
      searchResult = '';
    }
    searchResult.split('\n').filter(function (l) {
      return !!l;
    }).forEach(function (result) {
      var firstColon = nthIndex(result, ':', 1);
      var secondColon = nthIndex(result, ':', 2);
      var file = result.substr(0, firstColon);
      var lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)));
      files[file + ':' + lineNo] = { file: file, lineNo: lineNo };
    });
  });
  // convert to array of objects
  return Object.keys(files).sort().map(function (key) {
    return files[key];
  });
}

function findPathInServer(options, path) {
  // coalesce array of server dirs
  var dirs = dirsToArray(options.server);
  if (dirs.length === 0) {
    return [];
  }
  var files = {};
  dirs.forEach(function (dir) {
    var searchResult = '';
    try {
      searchResult = String(execSync('grep -rn --include=\\*.js --include=\\*.json \'' + path + '\' ' + dir));
    } catch (e) {
      searchResult = '';
    }
    searchResult.split('\n').filter(function (l) {
      return !!l;
    }).forEach(function (result) {
      var firstColon = nthIndex(result, ':', 1);
      var secondColon = nthIndex(result, ':', 2);
      var file = result.substr(0, firstColon);
      var lineNo = Number(result.substr(firstColon + 1, secondColon - (firstColon + 1)));
      files[file + ':' + lineNo] = {
        file: file,
        lineNo: lineNo,
        lastModified: _fs2.default.statSync(file).mtime
      };
    });
  });
  // convert to array of objects
  return Object.keys(files).sort().map(function (key) {
    return files[key];
  });
}

function createSrcPathRegExp(path) {
  var parts = path.split('/');
  var pattern = parts.map(function (p, i) {
    if (p.includes(':')) return '[\\s\\S]*';
    if (i + 1 === parts.length) return p + '*';
    return p;
  }).join('\\/');
  pattern = '(' + pattern + ')\\w+';
  return new RegExp(pattern);
}

function nthIndex(str, pat, n) {
  var L = str.length;
  var i = -1;
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i);
    if (i < 0) break;
  }
  return i;
}
;

(function () {
  var reactHotLoader = require('react-hot-loader').default;

  var leaveModule = require('react-hot-loader').leaveModule;

  if (!reactHotLoader) {
    return;
  }

  reactHotLoader.register(execSync, 'execSync', 'src/api-route-provider.js');
  reactHotLoader.register(dirsToArray, 'dirsToArray', 'src/api-route-provider.js');
  reactHotLoader.register(findPathInSrc, 'findPathInSrc', 'src/api-route-provider.js');
  reactHotLoader.register(findPathInServer, 'findPathInServer', 'src/api-route-provider.js');
  reactHotLoader.register(createSrcPathRegExp, 'createSrcPathRegExp', 'src/api-route-provider.js');
  reactHotLoader.register(nthIndex, 'nthIndex', 'src/api-route-provider.js');
  reactHotLoader.register(_default, 'default', 'src/api-route-provider.js');
  leaveModule(module);
})();

;