module.exports = getConfig

const fs = require('fs')
function getConfig() {
  if (fs.existsSync(__dirname+'/../config.json')) {
    return JSON.parse(fs.readFileSync(__dirname+'/../config.json', 'utf8'))
  } else {
    console.log('No config.json found. Please set one up according to the README.')
    process.exit()
  }
}
