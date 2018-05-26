import pathToRegexp from 'path-to-regexp/index'

export function getAvailableMethods (route) {
  return ['get', 'post', 'put', 'patch', 'delete'].filter(m => {
    return Object.keys(route.methods).includes(m)
  })
}

export function getMethodPayload (route, method) {
  let payload = route.payload
  if (!payload) return ''
  if (typeof payload === 'object' && !Array.isArray(payload)) {
    payload = payload[method.toUpperCase()] || payload
  }
  return JSON.stringify(payload || '', null, 4) || ''
}

export function getPathParams (route) {
  const urlParams = []
  pathToRegexp(route.path, urlParams)
  const routeParams = route.params || {}
  return urlParams.map(p => {
    const userDefined = routeParams[p.name] || {}
    return {
      ...p,
      value: '',
      help: '',
      ...userDefined
    }
  })
}

export function getQueryParams (route) {
  return Object.keys(route.query || {}).sort().map(name => {
    const param = route.query[name]
    const isObject = typeof param === 'object'
    return {
      name,
      value: isObject ? param.value : '',
      help: isObject ? param.help : ''
    }
  })
}
