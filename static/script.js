let focus = {
  x: 1,
  y: 0
}
window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Do nothing if the event was already processed
  }

  switch (event.key) {
    case "ArrowDown":
      // code for "down arrow" key press.
      focus.y += 1
      break;
    case "ArrowUp":
      // code for "up arrow" key press.
      if(focus.y>0) {
        focus.y -= 1
      }
      break;
    case "ArrowLeft":
      // code for "left arrow" key press.
      if(focus.x>0) {
        focus.x -= 1
      }
      break;
    case "ArrowRight":
      // code for "right arrow" key press.
      focus.x += 1
      break;
    case "Enter":
      // code for "right arrow" key press.
      break;
    default:
      return; // Quit when this doesn't handle the key event.
  }
  console.log(JSON.stringify(focus, null, 2))
  refreshFocus()
  // Cancel the default action to avoid it being handled twice
  event.preventDefault();
}, true);

function refreshFocus() {
  console.log('f'+focus.x+'-'+focus.y)
  let focusObj = document.getElementById('f'+focus.x+'-'+focus.y)
  if (focusObj) {
    focusObj.focus()
  }
}
