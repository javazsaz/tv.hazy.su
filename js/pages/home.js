module.exports = genPage

const fs = require('fs')
const config = require('../config')()
const cheerio = require('cheerio')
const ytpl = require('ytpl')
const ytrend = require("yt-trending-scraper")


function genPage(req, res, next) {
  fs.readFile('html/home/index.html', 'utf8', async function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    let playlist = await ytpl(config.homePlaylist)
    playlist.items.reverse()
    for (let i = 0; i < playlist.items.length; i ++) {
      let video = `
      <div class="vid">
        <a href="watch?v=${playlist.items[i].id}">
          <img class="thumb" src="/api/proxy/https://i.ytimg.com/vi/${playlist.items[i].id}/hqdefault.jpg">
        </a>
        <div class="metadata">
          <a href="watch?v=${playlist.items[i].id}">
            <p class="title">${playlist.items[i].title}</p>
          </a>
          <a href="/creator/${playlist.items[i].author.channelID}">
            <p class="creator">${playlist.items[i].author.name}</p>
          </a>
          <p class="smallData">${playlist.items[i].duration}</p>
        </div>
      </div>
      `
      $( '#suggestBar' ).append( video )
    }
    let trending = await ytrend.scrape_trending_page('US', false)
    for (let i = 0; i < trending.length; i ++) {
      let video = `
      <div class="vid">
        <a href="watch?v=${trending[i].videoId}">
          <img class="thumb" src="/api/proxy/https://i.ytimg.com/vi/${trending[i].videoId}/hqdefault.jpg">
        </a>
        <div class="metadata">
          <a href="watch?v=${trending[i].videoId}">
            <p class="title">${trending[i].title}</p>
          </a>
          <a href="/creator/${trending[i].authorId}">
            <p class="creator">${trending[i].author}</p>
          </a>
          <p class="smallData">${trending[i].timeText}</p>
        </div>
      </div>
      `
      $( '#usTrendBar' ).append( video )
    }

    res.send($.html())

  })
}
