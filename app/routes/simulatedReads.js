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
        res.end('Will send all the simulated reads to you!');
});

router.route('/:dataId')
.all(function(req,res,next) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      next();
})

.get(function(req,res,next){
        res.end('Will send details of the data: ' + req.params.dataId +' to you!');
});

module.exports = router;