import { Timer } from './timer.js'

let timer = undefined
let app = undefined

document.addEventListener("DOMContentLoaded", function (event) {
  console.log('document loaded')
  timer = new Timer()
  app = new Vue({
    el: '#app',
    data: {
      timer: timer,
      settings: {
        useInspection: true,
        hideTimerWhileSolving: false,
        coloriseScramble: true,
        nightMode: false
      },
      currentFocused: -1,
      turnColors: {
        'U': '#9b59b6',
        'U2': '#9b59b6',
        'U\'': '#8e44ad',
        'D': '#f1c40f',
        'D2': '#f1c40f',
        'D\'': '#f39c12',
        'L': '#3498db',
        'L2': '#3498db',
        'L\'': '#2980b9',
        'R': '#2ecc71',
        'R2': '#2ecc71',
        'R\'': '#27ae60',
        'F': '#e74c3c',
        'F2': '#e74c3c',
        'F\'': '#c0392b',
        'B': '#e67e22',
        'B2': '#e67e22',
        'B\'': '#d35400',
      }
    },
    methods: {
      timeInfoRow: function(index) {
        return Math.floor(index / 5) + " / " + Math.floor(index / 5)
      }
    }
  })
});

document.addEventListener('keyup', (event) => {
  if (event.key == ' ') {
    event.preventDefault()
    timer.proceed()
  }

  // fetch('scrambles/3x3').then(function (response) {
  //   return response.json()
  // }).then(function (scramble) {
  //   console.log(scramble)
  // })
})