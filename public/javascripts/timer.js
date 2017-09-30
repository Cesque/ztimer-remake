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

    this.resolution = 10 //ms

    this.currentSolve = {
      time: 0,
      penalty: 0,
      dnf: false,
      type: '',
      scramble: '',
      tags: [],
      comments: ''
    }
  }

  resetCurrent() {
    this.currentSolve = {
      time: 0,
      penalty: 0,
      dnf: false,
      type: this.type,
      scramble: '',
      tags: [],
      comments: ''
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
  }

  getAverageOfNAtIndex(n, index) {
    if (index + n >= this.solves.length) return null
    let subsolves = this.solves.slice(-n)

    let dnfs = this.solves.filter(x => x.dnf == true).length
    if(dnfs > 1) return 'dnf'

    let count = 0
    let min = Infinity
    for (let i = 0; i < n; i++) {
      let time = subsolves.time + subsolves.penalty
      count += time
      if(time < min) min = time
    }

    count -= min
    return count/(n-1)
  }

  getCurrentAverageOf(n) {
    return getAverageOfNAtIndex(n, this.solves.length - (n + 1))
  }

  getBestAverageOf(n) {
    let best = {
      index: -1,
      time: Infinity
    }

    for (let i = 0; i < this.solves.length - n - 1; i++) {
      let average = getAverageOfNAtIndex(n, i)
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

  scramble() {
    if (this.state != stopped) throw 'can\'t scramble while solving'
    fetch('scrambles/3x3').then(function (response) {
      return response.json()
    }).then(function (scramble) {
      this.currentSolve.scramble = scramble
    })
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