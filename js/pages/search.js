module.exports = genPage

const fs = require('fs')
const cheerio = require('cheerio')
const ytsr = require('ytsr')

async function genPage(req, res, next) {
  fs.readFile('html/search/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    if (req.query.q) {
      $( '#info' ).attr( 'style', 'display: none;' )
      $('#searchBar').attr('value', req.query.q)
      ytsr(req.query.q).then(function(data) {
        let l = 20
        if (data.items.length < 20) {
          l = data.items.length
        }
        for (let i = 0; i < l; i ++) {

          switch (data.items[i].type) {
            case 'video':
              $( '#results' ).append(`
                <div class="result">
                  <a href="/watch?v=${data.items[i].id}">
                    <div class="thumb">
                      <img class="staticThumb" src=/api/proxy/${data.items[i].bestThumbnail.url}>
                    </div>
                  </a>
                  <div class="suggestMeta">
                    <a href="/watch?v=${data.items[i].id}">
                      <p class="title">${data.items[i].title}</p>
                    </a>
                    <a href="/creator/${data.items[i].author.channelID}">
                      <p class="author">${data.items[i].author.name}</p>
                    </a>
                    <p class="viewCount">${data.items[i].views.toLocaleString('en-US')} views</p>
                  </div>
                </div>
                `)
              break;
            case 'channel':
              $( '#results' ).append(`
                <a href="/creator/${data.items[i].channelID}">
                  <div class="result">
                    <div class="avatar">
                      <img class="staticThumb" src=/api/proxy/${data.items[i].bestAvatar.url}>
                    </div>
                    <div class="resultMeta">
                      <p class="title">${data.items[i].name}</p>
                      <p class="viewCount">${data.items[i].subscribers}</p>
                    </div>
                  </div>
                </a>
                `)
              break;
          }

        }
        $( '#results' ).append( '<div style="height: 20px;"></div>' )
        res.status(200).send($.html())


      }).catch(function(err) {
        console.log(err)
        res.status(500).send(err)
      })

    }else{
      $( '#results' ).attr( 'style', 'display: none;' )
      res.status(200).send($.html())
    }

  })
}
