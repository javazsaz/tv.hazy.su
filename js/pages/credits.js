module.exports = genPage

const fs = require('fs')
const cheerio = require('cheerio')

async function genPage(req, res, next) {
  fs.readFile('html/credits/index.html', 'utf8', function(err, data){
    if (err) {
      console.log(err)
      res.status(500).send('server error.')
      return
    }
    const $ = cheerio.load(data)

    res.status(200).send($.html())

  })
}
