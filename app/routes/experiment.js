var express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose');

var Experiment = require('../models/experiment');

var router = express.Router();
router.use( bodyParser.json());
router.route('/') 

      .get(function (req, res, next) {
            Experiment.find({},function(err,experiments){
                  if(err) throw err;
                  res.json( experiments );
            });
      })

      .post(function(req,res,next){
            Experiment.create(req.body, function(err,exp){
                  if(err) throw err;
                  console.log( "experiment posted!");
                  var id = exp._id;
                  res.writeHead(200,{'Content-Type':'text/plain'});
                  res.end('Added the exp id: ' + id );
            });
      })
      
;

// router.route('/:expId')
// .all(function(req,res,next) {
//       res.writeHead(200, { 'Content-Type': 'text/plain' });
//       next();
// })

// .get(function(req,res,next){
//         res.end('Will send details of the experiment: ' + req.params.expId +' to you!');
// });

module.exports = router;