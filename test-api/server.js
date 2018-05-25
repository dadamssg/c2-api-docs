import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import cors from 'cors'
import apiDoc from '../src/api-route-provider'

const app = express()
app.use(cors())
app.use(bodyParser.json())

apiDoc(app, {
  dir: path.resolve(__dirname, 'routes'),
  title: 'Example API Docs'
})

const PORT = process.env.PORT || 5033
app.listen(PORT, () => {
  console.log('Dev Express server running at localhost:' + PORT) // eslint-disable-line
})
