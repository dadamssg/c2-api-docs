# c2-api-docs

Generate express api documentation automagically.

## Install
```
yarn add -D ClearC2/c2-api-docs
```

Create a new `routes` directory.

```
server/
  routes/
  server.js
```

In your express api bootstrap file:

```js
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import cors from 'cors'
import document from 'c2-api-docs'

const app = express()
app.use(cors())
app.use(bodyParser.json())

// routes added here

document(app, {
  routes: path.resolve(__dirname, 'routes'),
  title: 'IOP API Docs'
})

const PORT = process.env.PORT || 5033
app.listen(PORT, () => {
  console.log('Dev Express server running at localhost:' + PORT)
})

```

After starting your mock server, you will have an api explorer at `http://localhost:<port>/_docs`.

## Route files
This package gives you a new way to define mock endpoints through route files. Route files can be nested in the `routes` directory. Example:

```
server/
  routes/
    auth-info.js
    companies/
      get-companies.js
      save-company.js
  server.js
```

### Structure
Route files must export a javascript object. See this example route file.
```js
export default {
  path: '/companies/:companyUnid/employees',
  methods: ['get'],
  title: 'Company employees',
  description: 'Fetches all active employees',
  response: {
    employees: [
      {
        name: 'John Doe'
      },
      {
        name: 'Bob Smith'
      }
    ]
  }
}

```

#### path
This must be a valid express route path.

#### methods
This must be an array of http verbs that this endpoint responds to. Ex. `['get', 'post', 'put', 'delete']`

#### title
Only used for documentation in the api explorer ui.

#### description
Only used for documentation in the api explorer ui.

#### url params
URL params are the tokens prefixed by `:` in the path. These params can be further defined:
```js
export default {
  path: '/companies/:companyUnid/employees',
  params: {
    companyUnid: 'abcdef'
  }
  // ...
}
```

This will prepolate this params input in the api explorer. You can provide additional help text by using an object.
```js
export default {
  path: '/companies/:companyUnid/employees',
  params: {
    companyUnid: {
      value: 'abcdef',
      help: 'Company Unid'
    }
  }
  // ...
}
```
The `help` text will show up directly beneath the param's input in the api explorer.

#### query Params
Query params can be defined in the same way.
```js
export default {
  path: '/companies/:companyUnid/employees',
  query: {
    hiredAfter: {
      value: '01-01-2018',
      help: 'Format MM-DD-YYYY'
    }
  }
  // ...
}
```

#### payload
`POST` and `PUT` methods allow for example payloads. These payloads will populate the payload input in the api explorer.
```js
export default {
  path: '/contact',
  methods: ['post'],
  payload: {
    contact: {
      firstName: 'John',
      lastName: 'Doe'
    }
  }
  // ...
}
```

In the case of endpoints accepting both `POST` and `PUT` requests, you can define unique payloads for both.
```js
export default {
  path: '/contact',
  methods: ['post', 'put'],
  payload: {
    POST: {
      contact: {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    PUT: {
      contact: {
        id: 'abcded',
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  }
  // ...
}
```

#### response
Endpoints return responses. These can be a javascript object.
```js
export default {
  path: '/people',
  methods: ['get'],
  response: {
    people: {
      [
        {name: 'John Doe'},
        {name: 'Bob Smith'}
      ]
    }
  }
}
```
Or dynamically generate a response based on the request.

```js
export default {
  path: '/people',
  methods: ['get', 'post', 'put'],
  response: (req, res) => {
    if (req.method === 'POST') {
      return res.status(400).json({
        errors: [
          {detail: 'Something went wrong :('}
        ]
      })
    }

    if (req.method === 'PUT') {
      return res.status(500).json({
        errors: [
          {detail: 'CRITICAL FAILURE'}
        ]
      })
    }

    return res.status(200).json(require('../fixtures/people.json'))
  }
}
```
