export class Timer {
  constructor() {
    this.solves = []

    this.precision = 2
    this.type = '3x3'
    this.types = [
      '2x2',
      '3x3',
      '4x4',
      'pyraminx',
    ]

    this.useInspectionTime = true
    this.inspectionTimer = 0

    this.timer = 0.0

    this.state = 'stopped'

    this.interval = null

    this.resolution = 1 //ms

    this.currentSolve = {
      time: 0,
      penalty: 0,
      dnf: false,
      type: '',
      scramble: '',
      tags: [],
    }

    this.scrambles = []

    this.averages = {
      current: {
        5: 0,
        12: 0,
        50: 0,
      },
      best: {
        1: 0,
        5: 0,
        12: 0,
        50: 0,
      }
    }

    this.scramble()
  }

  resetCurrent() {
    this.currentSolve = {
      time: 0,
      penalty: 0,
      dnf: false,
      type: this.type,
      scramble: '',
      tags: [],
    }
  }

  startInspection() {
    clearInterval(this.interval)
    this.state = 'inspection'
    this.inspectionTimer = 15
    this.interval = setInterval(this.update.bind(this), this.resolution)
  }

  startTimer() {
    clearInterval(this.interval)
    this.state = 'solving'
    this.timer = 0.0
    this.interval = setInterval(this.update.bind(this), this.resolution)
  }

  stopTimer() {
    clearInterval(this.interval)
    this.currentSolve.time = Math.round(this.timer*(10**3)) / (10**3)
    this.state = 'stopped'
    this.submit()
  }

  update() {
    if (this.state == 'stopped') {
      return false
    } else if (this.state == 'inspection') {
      this.inspectionTimer -= this.resolution/1000
      if (this.inspectionTimer <= -2) {
        this.currentSolve.dnf = true
        this.currentSolve.time = 0
        this.currentSolve.penalty = 0
        this.stopTimer()
      } 
      else if (this.inspectionTimer <= 0) {
        this.currentSolve.penalty = +2
      }
    } else if (this.state == 'solving') {
      this.timer += this.resolution/1000
    }
  }

  submit() {
    this.solves.push(this.currentSolve)
    this.resetCurrent()
    this.updateAverages()
    this.scramble()
  }

  updateAverages() {
    this.averages = {
      current: {
        of5: this.getCurrentAverageOf(5),
        of12: this.getCurrentAverageOf(12),
        of50: this.getCurrentAverageOf(50),
      },
      best: {
        of1: this.getBestTime(),
        of5: this.getBestAverageOf(5),
        of12: this.getBestAverageOf(12),
        of50: this.getBestAverageOf(50),
      }
    } 
  }

  getAverageOfNAtIndex(n, index) {
    if (index + n > this.solves.length) return null
    let subsolves = this.solves.slice(index, index + n)
    console.log(n, index, subsolves.length)

    let dnfs = this.solves.filter(x => x.dnf == true).length
    if(dnfs > 1) return 'dnf'

    let count = 0
    let min = Infinity
    for (let i = 0; i < n; i++) {
      let time = subsolves[i].time + subsolves[i].penalty
      count += time
      if(time < min) min = time
    }

    count -= min
    return Math.round(count/(n-1)*(10**3)) / (10**3)
  }

  getCurrentAverageOf(n) {
    if (n > this.solves.length) return null
    return this.getAverageOfNAtIndex(n, this.solves.length - n)
  }

  getBestAverageOf(n) {
    if (n > this.solves.length) return null
    let best = {
      index: -1,
      time: Infinity
    }

    for (let i = 0; i <= this.solves.length - n; i++) {
      let average = this.getAverageOfNAtIndex(n, i)
      if (best.time == Infinity && average == 'dnf') {
        best.index = i
        best.time = 'dnf'
      }
      if (average < best.time || best.time == 'dnf') {
        best.index = i
        best.time = average  
      }
    }

    return best
  }

  getBestTime() {
    let best = {
      index: -1,
      time: Infinity
    }

    for (var i = 0; i < this.solves.length; i++) {
      let solve = this.solves[i];
      if (best.time == Infinity && solve.dnf) {
        best.index = i
        best.time = 'dnf'
      }
      if ((solve.time + solve.penalty) < best.time || best.time == 'dnf') {
        best.index = i
        best.time = (solve.time + solve.penalty) 
      }
    }

    return best
  }

  scramble() {
    if (this.state != 'stopped') throw 'can\'t scramble while solving'
    if (this.scrambles.length == 0) {
      fetch('scrambles/3x3?count=12').then(function (response) {
        return response.json()
      }).then((scrambleInfo) => {
        console.log('got 12 new scrambles')
        this.scrambles = scrambleInfo.scrambles
        this.currentSolve.scramble = this.scrambles.pop()
      })
    } else {
      this.currentSolve.scramble = this.scrambles.pop()
    }
  }

  proceed() {
    let s = this.state
    switch (this.state) {
      case 'stopped':
        if (this.useInspectionTime) {
          this.startInspection()
        } else {
          this.startTimer()
        }
        break
      case 'inspection': 
        this.startTimer()
        break
      case 'solving':
        this.stopTimer()
        break
    }
  }
}