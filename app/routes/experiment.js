var express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var Experiment = require('../models/experiment');

var router = express.Router();
router.use(bodyParser.json());
router.route('/')
    .post(function (req, res, next) {
        console.log(req.body);

        var exp = req.body;

        Experiment.create({
            user: exp.user,
            private: exp.private,
            email: exp.email,
            description: exp.description,
            reads: {
                name: "readsName",
                description: "somDesc",
                onServer: true,
                uri: "somURI",
                data: "somData",
                size: 0
            },
            taxonomy: {
                name: "taxName",
                description: "somDesc",
                onServer: true,
                uri: "somURI",
                data: "somData",
                size: 0
            },
            config: {
                algorithms: exp.config.algorithms,
                minScore: exp.config.minScore,
                minNumAgreed: exp.config.minNumAgreed,
                penalty: exp.config.penalty
            }
        },function (err, exp) {
            if (err) {
                throw err;
            }
            console.log("experiment posted!:" + exp);
            var id = exp._id;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the exp id: ' + id);
        });
    })

    .get(function (req, res, next) {
        Experiment.find({}, function (err, experiments) {
            if (err) throw err;
            res.json(experiments);
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