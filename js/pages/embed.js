module.exports = genPage

const ytdl = require('ytdl-core')
const cheerio = require('cheerio')
const stats = require('../stats')
const fs = require('fs')

function genPage(req, res, next) {
  fs.readFile('html/embed/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    stats.addEmbedView()
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
}
