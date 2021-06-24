module.exports = genPage

const fs = require('fs')
const config = require('../config')()
const cheerio = require('cheerio')
const ytdl = require('ytdl-core')
const ytcm = require("yt-comment-scraper")
const stats = require('../stats')
const {escapeHtml, replaceContent, timestamp} = require('../cleaning')


function genPage(req, res, next) {
  fs.readFile('html/watch/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    let timecode = ''
    if (req.query.t) {
      timecode += '#t='+req.query.t
      $( '#player' ).attr( 'autoplay', 'true' )
    }
    if (!req.query.v) {
      res.redirect('/')
      return
    }

    ytdl.getInfo(req.query.v).then(async info => {
      let video = ytdl.chooseFormat(info.formats, { quality: 'highest' })
      let audio = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })
      let vidFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
      stats.addView()
      if (req.cookies.proxyOn=='true') {
        for (let i = 0; i < vidFormats.length; i ++) {
          let vidTrack = `<source id="vidSrc" src="/api/proxy/video/${i}/${info.videoDetails.videoId}${timecode}" type='${vidFormats[i].mimeType}'>`
          $( '#player' ).prepend( vidTrack )
        }
      }else{
        if (req.cookies.proxyOn=='false') {
          for (let i = 0; i < vidFormats.length; i ++) {
            let vidTrack = `<source id="vidSrc" src="${vidFormats[i].url}${timecode}" type='${vidFormats[i].mimeType}'>`
            $( '#player' ).prepend( vidTrack )
          }
        }else{
          if (config.proxyDefault) {
            for (let i = 0; i < vidFormats.length; i ++) {
              let vidTrack = `<source id="vidSrc" src="/api/proxy/video/${i}/${info.videoDetails.videoId}${timecode}" type='${vidFormats[i].mimeType}'>`
              $( '#player' ).prepend( vidTrack )
            }
          }else{
            for (let i = 0; i < vidFormats.length; i ++) {
              let vidTrack = `<source id="vidSrc" src="${vidFormats[i].url}${timecode}" type='${vidFormats[i].mimeType}'>`
              $( '#player' ).prepend( vidTrack )
            }
          }
        }
      }

      $( '#player' ).attr( 'poster',  `/api/proxy/${info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url}` )
      $( '#title' ).text( info.videoDetails.title )
      let views = parseInt(info.videoDetails.viewCount)
      let publishDate = new Date(info.videoDetails.publishDate);
      let options = { year: 'numeric', month: 'long', day: 'numeric' };
      $( '#vidDate' ).text( `Published ${publishDate.toLocaleDateString('en-US', options)}` )
      $( '#views' ).text( views.toLocaleString('en-US') + ' views' )
      $( '#channelLink' ).attr('href', `/creator/${info.videoDetails.author.id}`)
      $( '#authorAvatar' ).attr( 'src',  `/api/proxy/${info.videoDetails.author.thumbnails[info.videoDetails.author.thumbnails.length-1].url}` )
      $( '#authorName' ).text( info.videoDetails.author.name )
      if (info.videoDetails.description!=null) {
        let description = replaceContent(escapeHtml(info.videoDetails.description)).replace(/\n/g, "<br />")
        let timestampParsed = timestamp(description, info.videoDetails.videoId)
        $( '#desc' ).html( timestampParsed )
      }else{
        $( '#desc' ).html( '...No description...' )
      }
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
          <div class="suggestion">
            <a href="/watch?v=${info.related_videos[i].id}">
              <div class="thumb">
                <img class="staticThumb" src=/api/proxy/${info.related_videos[i].thumbnails[info.related_videos[i].thumbnails.length-1].url}>
                <img class="moveThumb" src=/api/proxy/${info.related_videos[i].richThumbnails[info.related_videos[i].richThumbnails.length-1].url}>
              </div>
            </a>
            <div class="suggestMeta">
              <a href="/watch?v=${info.related_videos[i].id}">
                <p class="title">${info.related_videos[i].title}</p>
              </a>
              <a href="/creator/${info.related_videos[i].author.id}">
                <p class="author">${info.related_videos[i].author.name}</p>
              </a>
              <p class="viewCount">${info.related_videos[i].short_view_count_text} views</p>
            </div>
          </div>
          `
        }else{
          video = `
          <div class="suggestion">
            <a href="/watch?v=${info.related_videos[i].id}">
              <div class="thumb">
                <img class="staticThumb" src=/api/proxy/${info.related_videos[i].thumbnails[info.related_videos[i].thumbnails.length-1].url}>
                <img class="moveThumb" src=/api/proxy/${info.related_videos[i].thumbnails[info.related_videos[i].thumbnails.length-1].url}>
              </div>
            </a>
            <div class="suggestMeta">
              <a href="/watch?v=${info.related_videos[i].id}">
                <p class="title">${info.related_videos[i].title}</p>
              </a>
              <a href="/creator/${info.related_videos[i].author.id}">
                <p class="author">${info.related_videos[i].author.name}</p>
              </a>
              <p class="viewCount">${info.related_videos[i].short_view_count_text} views</p>
            </div>
          </div>
          `
        }

        $( '#similar' ).append( video )
      }

      $( '#commDetails' ).append( `<iframe class="commentFrame" src="/comments?v=${req.query.v}" title="YouTube comments"></iframe>` )


      let headElements = `
      <meta name="twitter:card" content="player">
      <meta name="twitter:title" content="${info.videoDetails.title} - watch on tv.hazy.su">
      <meta name="twitter:description" content="${info.videoDetails.description}">
      <meta name="twitter:image" content="${info.videoDetails.thumbnails[info.videoDetails.thumbnails.length-1].url}">
      <meta name="twitter:player" content="https://tv.hazy.su/embed/${info.videoDetails.videoId}">
      <meta name="twitter:player:width" content="1280">
      <meta name="twitter:player:height" content="720">
      `
      $( 'head' ).append( headElements )
      $( 'title' ).text(`${info.videoDetails.title} - tv.hazy.su`)
      res.status(200).send($.html())
    }).catch(function(err) {
      console.log(err)
      res.status(500).json({
        'message': "something went wrong. try refreshing the page. if this doesn't work, please submit an issue.",
        'github issue page': "https://github.com/hazysu/tv.hazy.su/issues",
        'error stack': err.stack})
    })





  })
}
