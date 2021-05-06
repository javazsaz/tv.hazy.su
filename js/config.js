module.exports = getConfig

const fs = require('fs')
function getConfig() {
  if (fs.existsSync(__dirname+'/../config.json')) {
    return JSON.parse(fs.readFileSync(__dirname+'/../config.json', 'utf8'))
  } else {
    if (process.env.PORT) {
      console.log('This may be running on Heroku, as indicated by PORT environment variable.')
      console.log('To ease deployment for Heroku, using config.example.json for config.')
      return JSON.parse(fs.readFileSync(__dirname+'/../config.example.json', 'utf8'))
    } else{
      console.log('No config.json found. Please set one up according to the README.')
      process.exit()
    }
  }
}
