module.exports = genPage

const fs = require('fs')
const cheerio = require('cheerio')
const ytch = require('yt-channel-info')

async function genPage(req, res, next) {
  fs.readFile('html/channel/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    ytch.getChannelInfo(req.params.channelID).then((response) => {
      if (response.authorBanners != null) {
        $('#banner').attr('style', `background-image: url("${response.authorBanners[response.authorBanners.length-1].url}");`)
      }else{
        $('#banner').attr('style', `display: none;`)
      }
      $('#avatar').attr('src', response.authorThumbnails[response.authorThumbnails.length-1].url)
      $('title').text(`${response.author} - tv.hazy.su`)
      $('#channelName').text(`${response.author}`)
      $('#subCount').text(`${response.subscriberText}`)

      ytch.getChannelVideos(req.params.channelID, 'newest').then((vids) => {

        for (let i = 0; i < vids.items.length; i ++) {
          let video = `
          <a href="/watch?v=${vids.items[i].videoId}">
          <div class="vid">
          <img class="thumb" src="https://i.ytimg.com/vi/${vids.items[i].videoId}/hqdefault.jpg">
          <div class="metadata">
          <p class="title">${vids.items[i].title}</p>
          <p class="creator">${vids.items[i].author}</p>
          <p class="smallData">${vids.items[i].viewCount.toLocaleString('en-US')} views</p>
          </div>
          </div>
          </a>
          `

          $( '#recentBar' ).append( video )
        }

        ytch.getChannelVideos(req.params.channelID, 'popular').then((vids) => {

          for (let i = 0; i < vids.items.length; i ++) {
            let video = `
            <a href="/watch?v=${vids.items[i].videoId}">
            <div class="vid">
            <img class="thumb" src="https://i.ytimg.com/vi/${vids.items[i].videoId}/hqdefault.jpg">
            <div class="metadata">
            <p class="title">${vids.items[i].title}</p>
            <p class="creator">${vids.items[i].author}</p>
            <p class="smallData">${vids.items[i].viewCount.toLocaleString('en-US')} views</p>
            </div>
            </div>
            </a>
            `

            $( '#popularBar' ).append( video )
          }



          res.status(200).send($.html())
          return

        }).catch((err) => {
          console.log(err)
          res.status(500).send($.html())
          return
        })

      }).catch((err) => {
        console.log(err)
        res.status(500).send($.html())
        return
      })

    }).catch((err) => {
      console.log(err)
      $('#banner').attr('style', `display: none;`)
      $('.contentBar').attr('style', `display: none;`)
      $('#error').attr('style', `display: inline-block;`)
      $('title').text(`Error - tv.hazy.su`)
      $('#channelName').text(`Error!`)
      $('#subCount').text(`Oops.`)
      if ((err+'').includes("Cannot read property 'title' of undefined")) {
        $('#error').text(`Something went wrong while gathering information about this creator.`)
        sendMessage(err.stack, 'ERROR')
      }
      if (err.isAxiosError) {
        if (err.response.status == 404) {
          $('#error').text(`This creator doesn't exist.`)
          sendMessage(err.stack, 'ERROR')
        }else{
          $('#error').text(`Something went wrong.`)
          sendMessage(err.stack, 'NEW_ERROR')
        }
      }
      res.status(500).send($.html())
    })

  })
}
