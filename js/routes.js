module.exports = routes

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const fs = require('fs')
const config = require('./config')()
const port = process.env.PORT || config.port

function routes() {
  app.use(cors())
  app.use(cookieParser())
  app.get('/', require('./pages/home'))
  app.get('/watch', require('./pages/watch'))
  app.get('/raw/:id', require('./pages/raw'))
  app.get('/embed/:id', require('./pages/embed'))
  app.get('/search', require('./pages/search'))
  app.use(express.static('static'))
  app.get('/creator/:channelID', require('./pages/creator'))
  app.get('/credits', require('./pages/credits'))
  app.get('/settings', require('./pages/settings'))
  app.get('/api/video/*', require('./api').video)
  app.get('/api/channel/:user', require('./api').channel)
  app.get('/api/playlist/*', require('./api').playlist)
  app.get('/api/trending/:location', require('./api').trending)
  app.get('/api/search', require('./api').search)
  app.get('/api/proxy/video/:format/*', require('./api').proxyVideo)
  app.get('/api/stats', require('./api').stats)
  app.get('/api/proxy/*', require('./api').proxy)
  app.post('/settings/toggleProxy', require('./api').toggleProxy)
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}
