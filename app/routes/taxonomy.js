var express = require('express'),
      bodyParser = require('body-parser'),
      mongoose = require('mongoose');

var Taxonomy = require('../models/taxonomy');

var router = express.Router();
router.use(bodyParser.json());
router.route('/')
      .get(function (req, res, next) {
            Taxonomy.find({},function(err,taxonomies){
                  if(err) throw err;
                  res.json( taxonomies );
            });
      })

      .post(function(req,res,next){
            Taxonomy.create(req.body, function(err,taxonomy){
                  if(err) throw err;
                  console.log( "taxonomy posted!");
                  var id = taxonomy._id;
                  res.writeHead(200,{'Content-Type':'text/plain'});
                  res.end('Added the taxonomy id: ' + id );
            });
      })
      
;

module.exports = router;