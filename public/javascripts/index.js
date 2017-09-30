import { Timer } from './timer.js'

let timer = undefined
let app = undefined

document.addEventListener("DOMContentLoaded", function (event) {
  console.log('document loaded')
  timer = new Timer()
  app = new Vue({
    el: '#app',
    data: {
      timer: timer
    }
  })
});

document.addEventListener('keyup', (event) => {
  if (event.key == ' ') {
    event.preventDefault()

    timer.proceed()
    console.log(timer.state)
    console.log(timer.solves)
  }

  fetch('scrambles/3x3').then(function (response) {
    return response.json()
  }).then(function (scramble) {
    console.log(scramble)
  })
})