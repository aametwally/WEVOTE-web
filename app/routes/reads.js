var express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose');

var Reads = require('../models/reads');

var router = express.Router();
router.use(bodyParser.json());
router.route('/')
      .get(function (req, res, next) {
            Reads.find({},function(err,reads){
                  if(err) throw err;
                  res.json( reads );
            });
      })

      .post(function(req,res,next){
            Reads.create(req.body, function(err,reads){
                  if(err) throw err;
                  console.log( "reads posted!");
                  var id = reads._id;
                  res.writeHead(200,{'Content-Type':'text/plain'});
                  res.end('Added the reads id: ' + id );
            });
      })
      
;


// router.route('/:dataId')
//       .get(function (req, res, next) {
//             res.end('Will send details of the data: ' + req.params.dataId + ' to you!');
//       });

module.exports = router;