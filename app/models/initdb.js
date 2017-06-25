fs = require('fs');
Algorithm = require('./algorithm');
Reads = require('./reads');

var initAlgorithms = function () {
    fs.readFile(__dirname + "/algorithm.json", 'utf8', function (err, data) {
        if (err) throw err;
        var datafromfile = JSON.parse(data);
        datafromfile.forEach(function (obj) {
            var alg = new Algorithm(obj);
            alg.save(function (err, doc) {
                if (err) throw err;
                console.log("Add algorithm: " + doc);
            });
        })
    })
};

var initReads = function () {
    fs.readFile(__dirname + "/reads.json", 'utf8', function (err, data) {
        if (err) throw err
        var datafromfile = JSON.parse(data);
        datafromfile.forEach(function (obj) {
            var reads = new Reads(obj);
            reads.save(function (err, doc) {
                if (err) throw err;
                console.log("Add reads: " + doc);
            });
        })
    })
};


var init = function () {

    Algorithm.remove({}, function (err) {
        if (err) throw err;
        console.log("Algorithm cleared");
        //To initialize when the collection is empty
        Algorithm.findOne({}, function (err, doc) {
            if (!doc) {
                //Collection is empty
                //build fomr file
                initAlgorithms();
            }
        });
    });

    Reads.remove({}, function (err) {
        if (err) throw err;
        console.log("Reads cleared");
        Reads.findOne({}, function (err, doc) {
            if (!doc) {
                //Collection is empty
                //build fomr file
                initReads();
            }
        });
    });
};

module.exports = {
    init: init,
    initAlgorithms: initAlgorithms,
    initReads: initReads
}