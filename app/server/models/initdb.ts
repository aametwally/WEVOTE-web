import * as fs from 'fs';
import { AlgorithmModel } from './algorithm';
import { ReadsModel } from './reads';
import { ExperimentModel } from './experiment';
import { TaxonomyAbundanceProfileModel } from './taxprofile';

let initAlgorithms = function () {
    fs.readFile(__dirname + "/algorithm.json", 'utf8', function (err, data) {
        if (err) throw err;
        let datafromfile = JSON.parse(data);
        datafromfile.forEach(function (obj: any) {
            AlgorithmModel.repo.create(obj, function (err, doc) {
                if (err) throw err;
                // console.log("Add algorithm: " + doc);
            });
        })
    })
};

let initReads = function () {
    fs.readFile(__dirname + "/reads.json", 'utf8', function (err, data) {
        if (err) throw err;
        let datafromfile = JSON.parse(data);
        datafromfile.forEach(function (obj: any) {
            ReadsModel.repo.create(obj, function (err, doc) {
                if (err) throw err;
                // console.log("Add reads: " + doc);
            });
        })
    })
};

let initTaxonomyAbundance = function () {
    fs.readFile(__dirname + "/taxprofile.csv", 'utf8', function (err, data) {
        if (err) throw err;
        let abundance = { taxa_abundance: csvJSON(data) };
        TaxonomyAbundanceProfileModel.repo.create(<any>abundance, function (err, doc) {
            if (err) throw err;
            // console.log("Add taxonomy abundance: " + doc);
        });
    })
};

export let csvJSON = (csv: any): any => {
    let lines = csv.split("\n");

    let result = [];

    let headers = lines[0].trim('\r').split(",");
    for (let i = 1; i < lines.length; i++) {

        let obj = {};
        let currentline = lines[i].trim('\r').split(",");
        if (currentline.length != headers.length) {
            continue;
        }


        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }
    //return result; //JavaScript object
    return result; //JSON
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

    TaxonomyAbundanceProfileModel.repo.drop(function (err: any) {
        if (err) throw err;
        console.log("TaxonomyAbundanceProfile cleared");
        TaxonomyAbundanceProfileModel.repo.findOne({}, function (err: any, doc: any) {
            if (!doc) {
                //Collection is empty
                //build fomr file
                initTaxonomyAbundance();
            }
        });
    });

    // ExperimentModel.repo.drop(function (err) {
    //     if (err) throw err;
    //     console.log("Experiments cleared");
    // });
};
