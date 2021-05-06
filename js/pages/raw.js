module.exports = genPage

const got = require('got')
const ytdl = require('ytdl-core')
const stats = require('../stats')

function genPage(req, res, next) {
  let id = req.params.id
  stats.addView()
  id = id.replace('.mp4', '')
  ytdl.getInfo(id).then(info => {
    let vidFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
    if (vidFormats[0]) {
      let url = vidFormats[0].url
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
  }).catch(function(err) {
    res.send(err)
  })
}
