module.exports = genPage

const fs = require('fs')
const config = require('../config')()
const cheerio = require('cheerio')
const ytcm = require("yt-comment-scraper")
const {escapeHtml, replaceContent, timestamp} = require('../cleaning')

async function genPage(req, res, next) {
  fs.readFile('html/watch/comments.html', 'utf8', async function(err, data){
    const $ = cheerio.load(data)

    let payload = {
      videoId: req.query.v, // Required
      sortByNewest: false,
      setCookie: true
    }
    try {
      let commentDat = await ytcm.getComments(payload)
      for (let i = 0; i < commentDat.comments.length; i ++) {
        let commentHtml = `
        <div class="commentObj">
          <img src="/api/proxy/${commentDat.comments[i].authorThumb[0].url}" alt="${commentDat.comments[i].author}'s profile picture" class="commentAvatar">
          <div class="commentMeta">
            <p class="commentAuthor">${commentDat.comments[i].author}</p>
            <input class="commentFull" type="checkbox">Read full comment</input>
            <p class="commentText">${commentDat.comments[i].text}</p>
          </div>
        </div>`
        $( 'body' ).append( commentHtml )
      }

    } catch (err) {

    }
    res.send($.html())
  })
}
