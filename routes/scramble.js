var express = require('express')
var router = express.Router()

let Scrambo = require('scrambo');
let puzzles = {
  '2x2': new Scrambo().type('222'),
  '3x3': new Scrambo().type('333'),
  '4x4': new Scrambo().type('444'),
  'pyraminx': new Scrambo().type('pyram'),
}

router.get('/:type', function (req, res, next) {
  let type = req.params.type
  let count = req.query.count || 1

  let list = puzzles[type].get(count)

  res.json({
    type: type,
    count: count,
    scrambles: list,
  })
})

module.exports = router
