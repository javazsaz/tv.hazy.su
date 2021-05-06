module.exports = {
  addView: addView,
  syncStats: syncStats,
  addEmbedView: addEmbedView,
  get: getStats
}


const fs = require('fs')

let stats
if (fs.existsSync('../stats.json')) {
  stats = JSON.parse(fs.readFileSync(__dirname+'/../stats.json', 'utf8'))
} else {
  stats = {
    totalViews: 0
  }
  fs.writeFileSync(__dirname+'/../stats.json', JSON.stringify(stats, null, 2), 'utf8')
}

function addView() {
  stats.totalViews += 1
  syncStats()
}
function addEmbedView() {
  if (stats.embedViews == undefined) {
    stats.embedViews = 0
  }
  stats.embedViews += 1
  stats.totalViews += 1
  syncStats()
}
function syncStats() {
  fs.writeFile(__dirname+'/../stats.json', JSON.stringify(stats, null, 2), 'utf8', function(err) {
    if (err) {
      console.log(err)
      return
    }
    console.log("Stats synced!")
  })
}
function getStats() {
  return stats
}
