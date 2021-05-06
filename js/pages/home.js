module.exports = genPage

const fs = require('fs')
const config = require('../config')()
const cheerio = require('cheerio')
const ytpl = require('ytpl')


function genPage(req, res, next) {
  fs.readFile('html/home/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    ytpl(config.homePlaylist).then(function(playlist) {
      playlist.items.reverse()

      for (let i = 0; i < playlist.items.length; i ++) {
        let video = `

        <div class="vid">
          <a href="watch?v=${playlist.items[i].id}">
            <img class="thumb" src="https://i.ytimg.com/vi/${playlist.items[i].id}/hqdefault.jpg">
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

      res.send($.html())


    }).catch(function (err) {
      res.json(err)
      console.log(err)
    })

  })
}
