var express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose');

var Algorithm = require('../models/algorithm');

var router = express.Router();
router.use(bodyParser.json());
router.route('/')
      .get(function (req, res, next) {
            Algorithm.find({},function(err,algorithms){
                  if(err) throw err;
                  res.json( algorithms );
            });
      });

// router.route('/:algId')
// .all(function(req,res,next) {
//       res.writeHead(200, { 'Content-Type': 'text/plain' });
//       next();
// })

// .get(function(req,res,next){
//         res.end('Will send details of the algorithm: ' + req.params.algId +' to you!');
// });

module.exports = router;