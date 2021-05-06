module.exports = {
  proxy: proxyPage,
  proxyVideo: proxyVideo,
  search: search,
  video: video,
  channel: channel,
  playlist: playlist,
  trending: trending,
  stats: stats,
  toggleProxy: toggleProxy
}

const got = require('got')
const ytdl = require('ytdl-core')
const ytpl = require('ytpl')
const ytsr = require('ytsr')
const ytch = require('yt-channel-info')
const ytrend = require("yt-trending-scraper")
const config = require('./config')()

async function proxyPage(req, res, next) {
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
}
async function proxyVideo(req, res, next) {
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
  }).catch(function(err) {
    res.send(err)
  })
}
async function search(req, res, next) {
  ytsr(req.query.q).then(function(data) {
    res.send(data)
  }).catch(function(err) {
    res.send(err)
  })
}
async function video(req, res, next) {
  let id = req.url.replace('/api/video/', '')
  ytdl.getInfo(id).then(info => {
    res.json(info)
  }).catch((err) => {
    res.status(500).send(err)
    console.log(err)
  })
}
async function channel(req, res, next) {
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
}
async function playlist(req, res, next) {
  let id = req.url.replace('/api/playlist/', '')
  id = id.replace('https://www.youtube.com/playlist?list=', '')
  ytpl(id).then(function(playlist) {
    res.json(playlist)
  }).catch(function (err) {
    res.json(err)
    console.log(err)
  })
}
async function trending(req, res, next) {
  ytrend.scrape_trending_page(req.params.location, false).then((data) =>{
    res.json(data)
  }).catch((error)=>{
    res.json(error)
    console.log(error)
  })
}
async function stats(req, res, next) {
  res.json(require('./stats').get())
}
async function toggleProxy(req, res, next) {
  if (req.cookies.proxyOn=='true') {
    res.cookie('proxyOn', 'false', { maxAge: 31540000 })
  }else{
    if (req.cookies.proxyOn=='false') {
      res.cookie('proxyOn', 'true', { maxAge: 31540000 })
    }else{
      if (config.proxyDefault) {
        res.cookie('proxyOn', 'false', { maxAge: 31540000 })
      }else{
        res.cookie('proxyOn', 'true', { maxAge: 31540000 })
      }
    }
  }
  res.redirect('/settings')
}
