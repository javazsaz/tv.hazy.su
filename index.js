const fs = require('fs')
require('dotenv').config()
require('./js/routes')()
require('./js/logs').start()
if (!fs.existsSync('config.json')) {
  console.log('No config.json found. Please set one up according to the README.')
  process.exit()
}
