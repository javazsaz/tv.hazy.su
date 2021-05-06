module.exports = genPage

const fs = require('fs')
const cheerio = require('cheerio')
const config = require('../config')()

async function genPage(req, res, next) {
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
      if (req.cookies.proxyOn=='false') {
        $( '#proxyLabel' ).text( 'Video proxy is currently off.' )
        $( '#proxyInput' ).attr( 'value', 'Enable video proxy' )
      }else{
        if (config.proxyDefault) {
          $( '#proxyLabel' ).text( 'Video proxy is currently on.' )
          $( '#proxyInput' ).attr( 'value', 'Disable video proxy' )
        }else{
          $( '#proxyLabel' ).text( 'Video proxy is currently off.' )
          $( '#proxyInput' ).attr( 'value', 'Enable video proxy' )
        }
      }
    }
    res.status(200).send($.html())
  })
}
