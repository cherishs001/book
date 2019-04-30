export const LastRead = {
  UpdateLastRead: function (element?: Element) {
    for (const $element of Array.from(document.getElementsByClassName('last-read'))) {
      $element.classList.remove('last-read');
    }
    if (element !== undefined) {
      element.classList.add("last-read");
    }
  }
}