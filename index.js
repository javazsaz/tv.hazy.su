const fs = require('fs')
const express = require('express')
const got = require('got')
const cheerio = require('cheerio')
const absolutify = require('absolutify')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const ytch = require('yt-channel-info')
const ytrend = require("yt-trending-scraper")
const app = express()
const port = 3009

app.get('/', (req, res) => {
  fs.readFile('html/home/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    ytrend.scrape_trending_page('US', true).then((data) =>{
      for (let i = 0; i < data.length; i ++) {
        let video = `
        <a href="watch?v=${data[i].videoId}">
          <div class="vid">
            <img class="thumb" src="https://i.ytimg.com/vi/${data[i].videoId}/hqdefault.jpg">
            <div class="metadata">
              <p class="title">${data[i].title}</p>
              <p class="creator">${data[i].author}</p>
              <p class="smallData">${data[i].viewCount.toLocaleString('en-US')} views</p>
            </div>
          </div>
        </a>
        `

        $( '#usBar' ).append( video )
      }

      ytrend.scrape_trending_page('JP', true).then((data) =>{
        for (let i = 0; i < data.length; i ++) {
          let video = `
          <a href="watch?v=${data[i].videoId}">
            <div class="vid">
              <img class="thumb" src="https://i.ytimg.com/vi/${data[i].videoId}/hqdefault.jpg">
              <div class="metadata">
                <p class="title">${data[i].title}</p>
                <p class="creator">${data[i].author}</p>
                <p class="smallData">${data[i].viewCount.toLocaleString('en-JP')} views</p>
              </div>
            </div>
          </a>
          `

          $( '#jpBar' ).append( video )
        }
        res.send($.html())
        }).catch((error)=>{
          res.json(err)
          console.log(err)
        })

    }).catch((error)=>{
      res.json(err)
      console.log(err)
    })







  })
})

app.get('/watch', (req, res) => {
  fs.readFile('html/watch/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    ytdl.getInfo(req.query.v).then(info => {
      let video = ytdl.chooseFormat(info.formats, { quality: 'highest' })
      let audio = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
      $( '#player' ).attr( 'poster',  info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url )
      $( '#vidSrc' ).attr( 'src',  `${video.url}` )
      $( '#vidSrc' ).attr( 'type',  video.mimeType )
      $( '#title' ).text( info.videoDetails.title )
      let views = parseInt(info.videoDetails.viewCount)
      $( '#views' ).text( views.toLocaleString('en-US') + ' views' )
      $( '#authorAvatar' ).attr( 'src',  info.videoDetails.author.thumbnails[info.videoDetails.author.thumbnails.length-1].url )
      $( '#authorName' ).text( info.videoDetails.author.name )
      $( '#desc' ).html( replaceContent(escapeHtml(info.videoDetails.description)) )

      for (let i = 0; i < info.related_videos.length; i ++) {
        let video = ''
        if (info.related_videos[i].richThumbnails.length) {
          video = `
          <a href="/watch?v=${info.related_videos[i].id}">
            <div class="suggestion">
              <div class="thumb">
                <img class="staticThumb" src=${info.related_videos[i].thumbnails[info.related_videos[i].thumbnails.length-1].url}>
                <img class="moveThumb" src=${info.related_videos[i].richThumbnails[info.related_videos[i].richThumbnails.length-1].url}>
              </div>
              <div class="suggestMeta">
                <p class="title">${info.related_videos[i].title}</p>
                <p class="author">${info.related_videos[i].author.name}</p>
                <p class="viewCount">${info.related_videos[i].short_view_count_text}</p>
              </div>
            </div>
          </a>
          `
        }else{
          video = `
          <a href="/watch?v=${info.related_videos[i].id}">
            <div class="suggestion">
              <div class="thumb">
                <img class="staticThumb" src=${info.related_videos[i].thumbnails[info.related_videos[i].thumbnails.length-1].url}>
                <img class="moveThumb" src=${info.related_videos[i].thumbnails[info.related_videos[i].thumbnails.length-1].url}>
              </div>
              <div class="suggestMeta">
                <p class="title">${info.related_videos[i].title}</p>
                <p class="author">${info.related_videos[i].author.name}</p>
                <p class="viewCount">${info.related_videos[i].short_view_count_text}</p>
              </div>
            </div>
          </a>
          `
        }

        $( '#similar' ).append( video )
      }

      let headElements = `
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="${info.videoDetails.title} - watch on tv.hazy.su" />
      <meta name="twitter:description" content="${info.videoDetails.description}" />
      <meta name="twitter:image" content="${info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url}" />
      `
      $( 'head' ).append( headElements )
      $( 'title' ).text(`${info.videoDetails.title} - tv.hazy.su`)
      res.status(200).send($.html())
    })





  })
})

app.use(express.static('static'))

app.get('/api/video/*', async (req, res) => {
  let id = req.url.replace('/api/video/', '')
  ytdl.getInfo(id).then(info => {
    res.json(info)
  })
})

app.get('/api/channel/:user', (req, res) => {
  ytch.getChannelInfo(req.params.user).then((response) => {
    res.status(200).send(response)
  }).catch((err) => {
    res.status(500).send(err)
    console.log(err)
  })
})

app.get('/api/playlist/*', async (req, res) => {
  let id = req.url.replace('/api/playlist/', '')
  id = id.replace('https://www.youtube.com/playlist?list=', '')
  ytpl(id).then(function(playlist) {
    res.json(playlist)
  }).catch(function (err) {
    res.json(err)
    console.log(err)
  })
})

app.get('/api/proxy/*', async (req, res) => {
  let url = req.url.replace('/api/proxy/', '')
  try {
    got.stream(url).on("error", function() {
      res.send()
    }).on("close", function() {
      res.send()
    }).pipe(res)
  } catch (error) {
    res.send(error.message)
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})



function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function replaceContent(content) {
  let exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  let element_content=content.replace(exp_match, "<a href='$1'>$1</a>");
  let new_exp_match =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
  let new_content=element_content.replace(new_exp_match, '$1<a target="_blank" href="http://$2">$2</a>');
  return new_content;
}
