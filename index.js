const fs = require('fs')
const cors = require('cors')
const express = require('express')
const cookieParser = require('cookie-parser')
const Discord = require('discord.js')
require('dotenv').config()
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
const client = new Discord.Client()

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

app.use(cors())
app.use(cookieParser())

app.get('/', (req, res) => {
  fs.readFile('html/home/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    ytpl('PLESiES1i-Thr37As7SP8ABmJCtuMR4zCf').then(function(playlist) {
      playlist.items.reverse()

      for (let i = 0; i < playlist.items.length; i ++) {
        let video = `
        <a href="watch?v=${playlist.items[i].id}">
        <div class="vid">
        <img class="thumb" src="https://i.ytimg.com/vi/${playlist.items[i].id}/hqdefault.jpg">
        <div class="metadata">
        <p class="title">${playlist.items[i].title}</p>
        <p class="creator">${playlist.items[i].author.name}</p>
        <p class="smallData">${playlist.items[i].duration}</p>
        </div>
        </div>
        </a>
        `

        $( '#suggestBar' ).append( video )
      }

      res.send($.html())


    }).catch(function (err) {
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
      let vidFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
      if (req.cookies.proxyOn=='true') {
        for (let i = 0; i < vidFormats.length; i ++) {
          let vidTrack = `<source id="vidSrc" src="/api/proxy/video/${i}/${info.videoDetails.videoId}" type='${vidFormats[i].mimeType}'>`
          $( '#player' ).prepend( vidTrack )
        }
      }else{
        if (!req.cookies.proxyOn) {
          for (let i = 0; i < vidFormats.length; i ++) {
            let vidTrack = `<source id="vidSrc" src="/api/proxy/video/${i}/${info.videoDetails.videoId}" type='${vidFormats[i].mimeType}'>`
            $( '#player' ).prepend( vidTrack )
          }
        }else{
          for (let i = 0; i < vidFormats.length; i ++) {
            let vidTrack = `<source id="vidSrc" src="${vidFormats[i].url}" type='${vidFormats[i].mimeType}'>`
            $( '#player' ).prepend( vidTrack )
          }
        }
      }

      $( '#player' ).attr( 'poster',  info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url )
      $( '#title' ).text( info.videoDetails.title )
      let views = parseInt(info.videoDetails.viewCount)
      $( '#views' ).text( views.toLocaleString('en-US') + ' views' )
      $( '#channelLink' ).attr('href', `/creator/${info.videoDetails.author.id}`)
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
          <p class="viewCount">${info.related_videos[i].short_view_count_text} views</p>
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
          <p class="viewCount">${info.related_videos[i].short_view_count_text} views</p>
          </div>
          </div>
          </a>
          `
        }

        $( '#similar' ).append( video )
      }

      let headElements = `
      <meta name="twitter:card" content="player" />
      <meta name="twitter:title" content="${info.videoDetails.title} - watch on tv.hazy.su" />
      <meta name="twitter:description" content="${info.videoDetails.description}" />
      <meta name="twitter:image" content="${info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url}" />
      <meta name="twitter:player" content="https://tv.hazy.su/embed/${info.videoDetails.videoId}" />
      <meta name="twitter:player:width" content="200" />
      <meta name="twitter:player:height" content="100" />
      `
      $( 'head' ).append( headElements )
      $( 'title' ).text(`${info.videoDetails.title} - tv.hazy.su`)
      res.status(200).send($.html())
    }).catch(function(err) {
      console.log(err)
      res.status(500).send(err)
    })





  })
})

app.get('/embed/:id', (req, res) => {
  fs.readFile('html/embed/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)
    ytdl.getInfo(req.params.id).then(info => {
      let video = ytdl.chooseFormat(info.formats, { quality: 'highest' })
      let audio = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
      let vidFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
      for (let i = 0; i < vidFormats.length; i ++) {
        let vidTrack = `<source id="vidSrc" src="/api/proxy/video/${i}/${info.videoDetails.videoId}" type='${vidFormats[i].mimeType}'>`
        $( '#player' ).prepend( vidTrack )
      }
      $( '#player' ).attr( 'poster',  info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url )
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

app.get('/creator/:channelID', async (req, res) => {
  fs.readFile('html/channel/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    ytch.getChannelInfo(req.params.channelID).then((response) => {
      $('#banner').attr('style', `background-image: url("${response.authorBanners[response.authorBanners.length-1].url}");`)
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
            <a href="watch?v=${vids.items[i].videoId}">
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
        sendMessage((err.stack+'').slice(0, 1700), 'ERROR')
      }
      if (err.isAxiosError) {
        if (err.response.status == 404) {
          $('#error').text(`This creator doesn't exist.`)
          sendMessage((err.stack+'').slice(0, 1700), 'ERROR')
        }else{
          $('#error').text(`Something went wrong.`)
          sendMessage((err.stack+'').slice(0, 1700), 'NEW_ERROR')
        }
      }
      res.status(500).send($.html())
    })

  })
})

app.get('/credits', async (req, res) => {
  fs.readFile('html/credits/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    res.status(200).send($.html())

  })
})

app.get('/settings', async (req, res) => {
  fs.readFile('html/settings/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    if (req.cookies.proxyOn=='true') {
      $( '#proxyLabel' ).text( 'Video proxy is currently on.' )
      $( '#proxyInput' ).attr( 'value', 'Disable video proxy' )
    }else{
      if (!req.cookies.proxyOn) {
        $( '#proxyLabel' ).text( 'Video proxy is currently on.' )
        $( '#proxyInput' ).attr( 'value', 'Disable video proxy' )
      }else{
        $( '#proxyLabel' ).text( 'Video proxy is currently off.' )
        $( '#proxyInput' ).attr( 'value', 'Enable video proxy' )
      }
    }

    res.status(200).send($.html())

  })
})

app.get('/api/video/*', async (req, res) => {
  let id = req.url.replace('/api/video/', '')
  ytdl.getInfo(id).then(info => {
    res.json(info)
  }).catch((err) => {
    res.status(500).send(err)
    console.log(err)
  })
})

app.get('/api/channel/:user', (req, res) => {
  ytch.getChannelInfo(req.params.user).then((response) => {
    ytch.getChannelVideos(req.params.user, 'newest').then((vids) => {
      res.send({info: response, videos: vids})
    }).catch((err) => {
      res.send(err)
    })
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

app.get('/api/trending/:location', async (req, res) => {
  ytrend.scrape_trending_page(req.params.location, false).then((data) =>{
    res.json(data)
  }).catch((error)=>{
    res.json(error)
    console.log(error)
  })
})

app.get('/api/search', async (req, res) => {
  ytsr(req.query.q).then(function(data) {
    res.send(data)
  }).catch(function(err) {
    res.send(err)
  })
})

app.get('/api/proxy/video/:format/*', async (req, res) => {
  let id = req.url.replace('/api/proxy/video/'+req.params.format+'/', '')
  ytdl.getInfo(id).then(info => {
    let vidFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
    if (vidFormats[parseInt(req.params.format)]) {
      let url = vidFormats[parseInt(req.params.format)].url
      try {
        got.stream(url).on("error", function() {
          res.send()
        }).on("close", function() {
          res.send()
        }).pipe(res)
      } catch (error) {
        res.send(error.message)
      }
    }else{
      res.status(404).json('that is not an index for the formats array.')
    }

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

app.post('/settings/toggleProxy', async (req, res) => {
  if (req.cookies.proxyOn=='true') {
    res.cookie('proxyOn', 'false', { maxAge: 31540000 })
  }else{
    if (!req.cookies.proxyOn) {
      res.cookie('proxyOn', 'false', { maxAge: 31540000 })
    }else{
      res.cookie('proxyOn', 'true', { maxAge: 31540000 })
    }
  }
  res.redirect('/settings')
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

function sendMessage(text, channelIDenv) {
  client.channels.cache.get(process.env[channelIDenv]).send(text)
}

client.login(process.env.DISCORD)
