var express = require('express'),
  bodyParser = require('body-parser');

var router = express.Router();
router.use( bodyParser.json());
router.route('/') 
.all(function(req,res,next) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      next();
})

.get(function(req,res,next){
        res.end('Will send all the algorithms to you!');
});

router.route('/:algId')
.all(function(req,res,next) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      next();
})

.get(function(req,res,next){
        res.end('Will send details of the algorithm: ' + req.params.algId +' to you!');
});

module.exports = router;