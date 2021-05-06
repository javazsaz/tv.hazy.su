module.exports = {
  start: start,
  sendMessage: sendMessage
}

let started = false
const config = require('./config')()

function start() {
  const Discord = require('discord.js')
  const client = new Discord.Client()

  if (config.logToDiscord) {
    client.login(process.env.DISCORD)
  }

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`)
    started = true
  })
}

function sendMessage(text, channelIDenv) {
  console.log(text)
  if (started) {
    if (config.logToDiscord) {
      client.channels.cache.get(process.env[channelIDenv]).send((text+'').slice(0, 1700))
    }
  } else {
    console.log('attempted to send error message through Discord, but Discord bot had not finished logging in.')
  }
}
