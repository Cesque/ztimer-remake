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
        nightMode: false,
        coloriseAverages: true,
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
      timeCellStyle: function (index) {
        let bg = 'rgba(255,255,255,0)'
        if (this.settings.coloriseAverages == false) return bg


        if (this.timer.solves.length >= 50) {
          let bo50 = this.timer.averages.best.of50
          if (index >= bo50.index && index < bo50.index + 50) {
            bg = 'rgba(255,230,0,0.1)'
          }
        }

        if (this.timer.solves.length >= 12) {
          let bo12 = this.timer.averages.best.of12
          if (index >= bo12.index && index < bo12.index + 12) {
            bg = 'rgba(255,128,0,0.1)'
          }
        }

        if (this.timer.solves.length >= 5) {
          let bo5 = this.timer.averages.best.of5
          if (index >= bo5.index && index < bo5.index + 5) {
            bg = 'rgba(255,0,0,0.2)'
          }
        }

        if (this.timer.solves.length >= 1) {
          let bo1 = this.timer.averages.best.of1
          if (index == bo1.index) {
            bg = 'rgba(255,0,128,0.4)'
          }
        }

        return {
          'background-color': bg,
          'font-weight': this.currentFocused == index ? 'bold' : 'normal',
          'color': this.timer.solves[index].dnf ? '#e74c3c' : '',
        }
      },
      inspectionTimerColor: function () {
        let color = lerpColor('#3498db', '#9b59b6', timer.inspectionTimer / 15)
        return {
          color: color
        }
      },
      deleteSolve: function () {
        if (this.currentFocused == -1) return
        timer.solves.splice(this.currentFocused, 1)
        timer.updateAverages()
        this.currentFocused = -1
      },
      cyclePenalty: function () {
        if (this.currentFocused == -1) return
        let solve = timer.solves[this.currentFocused]
        if (solve.dnf) {
          solve.dnf = false
          solve.penalty = 0
        } else if (solve.penalty == +2) {
          solve.penalty = 0
          solve.dnf = true
        } else {
          solve.dnf = false
          solve.penalty = +2
        }
        timer.updateAverages()
      }
    }
  })
});

document.addEventListener('keyup', (event) => {
  if (event.key == ' ') {
    event.preventDefault()
    timer.proceed()
  }
})

// from https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
function lerpColor(a, b, amount) {
  var ah = parseInt(a.replace(/#/g, ''), 16),
    ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
    bh = parseInt(b.replace(/#/g, ''), 16),
    br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);

  return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}