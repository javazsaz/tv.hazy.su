const fs = require('fs')
const express = require('express')
const got = require('got')
const cheerio = require('cheerio')
const absolutify = require('absolutify')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const ytsr = require('ytsr')
const ytch = require('yt-channel-info')
const ytrend = require("yt-trending-scraper")
const app = express()
const port = process.env.PORT || 3009

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
      $( '#desc' ).html( replaceContent(escapeHtml(info.videoDetails.description)).replace(/\n/g, "<br />") )
      $( '#ytLink' ).attr( 'href', `https://youtu.be/${info.videoDetails.videoId}` )
      if (info.player_response.captions != undefined) {
        for (let i = 0; i < info
				.player_response.captions
				.playerCaptionsTracklistRenderer.captionTracks.length; i ++) {
          let track = info
  				.player_response.captions
  				.playerCaptionsTracklistRenderer.captionTracks[i]
          let caption = `<track label="${track.name.simpleText}" kind="captions" srclang="${track.languageCode}" src="/api/proxy/${track.baseUrl}&fmt=vtt">`
          $( '#player' ).append( caption )
        }
			}


      if (info.related_videos.length==0) {
        $( '#similar' ).attr( 'style', 'display: none;' )
      }

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

app.get('/search', async (req, res) => {
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
          if (data.items[i].type=='video') {
            let response = `
            <a href="/watch?v=${data.items[i].id}">
            <div class="result">
            <div class="thumb">
            <img class="staticThumb" src=${data.items[i].bestThumbnail.url}>
            </div>
            <div class="resultMeta">
            <p class="title">${data.items[i].title}</p>
            <p class="author">${data.items[i].author.name}</p>
            <p class="viewCount">${data.items[i].views.toLocaleString('en-US')} views</p>
            </div>
            </div>
            </a>
            `
            $( '#results' ).append( response )
          }
        }
        $( '#results' ).append( '<div style="height: 20px;"></div>' )
        console.log('test: '+$.html()  )
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

app.get('/api/search', async (req, res) => {
  ytsr(req.query.q).then(function(data) {
    res.send(data)
  }).catch(function(err) {
    res.send(err)
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
