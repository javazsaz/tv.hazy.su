module.exports = {
  escapeHtml: escapeHtml,
  replaceContent: replaceContent,
  timestamp: timestamp
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}
function replaceContent(content) {
  let exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  let element_content=content.replace(exp_match, "<a href='$1'>$1</a>");
  let new_exp_match =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
  let new_content=element_content.replace(new_exp_match, '$1<a target="_blank" href="http://$2">$2</a>');
  return new_content;
}
function timestamp(text, id) {
  let newText = text.replace(/([0-9]{1,2}:){0,1}[0-9]{1,2}:[0-9]{2}/gm, replaceTimestamp)
  newText = newText.replace(/<<TIMESTAMP>>/gm, id)
  return newText
}
function replaceTimestamp(match) {
  let times = match.split(":")
  times.reverse()
  let seconds = 0
  seconds += parseInt(times[0])
  seconds += parseInt(times[1])*60
  if (times[2]) {
    seconds += (parseInt(times[2])*60)*60
  }
  return `<a href="/watch?v=<<TIMESTAMP>>&t=${seconds}">${match}</a>`
}
