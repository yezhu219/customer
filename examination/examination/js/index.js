$(function () {
  let url = window.location.href
  $('.nav li a').each(function () {
    let dataUrl = $(this).attr('data-url')
    if (url.indexOf(dataUrl) != -1) {
      $(this).addClass('change')
    }
  })
})