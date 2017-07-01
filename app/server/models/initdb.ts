import * as fs from 'fs';
import {AlgorithmModel} from './algorithm';
import {ReadsModel} from './reads';
import {ExperimentModel} from './experiment';


let initAlgorithms = function () {
    fs.readFile(__dirname + "/algorithm.json", 'utf8', function (err, data) {
        if (err) throw err;
        var datafromfile = JSON.parse(data);
        datafromfile.forEach(function (obj: any) {
            AlgorithmModel.repo.create(obj, function (err, doc) {
                if (err) throw err;
                console.log("Add algorithm: " + doc);
            });
        })
    })
};

let initReads = function () {
    fs.readFile(__dirname + "/reads.json", 'utf8', function (err, data) {
        if (err) throw err
        var datafromfile = JSON.parse(data);
        datafromfile.forEach(function (obj: any) {
            ReadsModel.repo.create(obj, function (err, doc) {
                if (err) throw err;
                console.log("Add reads: " + doc);
            });
        })
    })
};

export let init = function () {

    AlgorithmModel.repo.drop(function (err: any) {
        if (err) throw err;
        console.log("Algorithm cleared");
        //To initialize when the collection is empty
        AlgorithmModel.repo.findOne({}, function (err, doc) {
            if (!doc) {
                //Collection is empty
                //build fomr file
                initAlgorithms();
            }
        });
    });

    ReadsModel.repo.drop(function (err: any) {
        if (err) throw err;
        console.log("Reads cleared");
        ReadsModel.repo.findOne({}, function (err: any, doc: any) {
            if (!doc) {
                //Collection is empty
                //build fomr file
                initReads();
            }
        });
    });

    ExperimentModel.repo.drop(function (err) {
        if (err) throw err;
        console.log("Experiments cleared");
    });
};
