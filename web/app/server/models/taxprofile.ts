/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import { IExperimentModel, ExperimentModel } from './experiment';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as common from '../common/common';

export interface ITaxLine extends common.ITaxLine,  mongoose.Document {
}

export const taxlineSchema = new mongoose.Schema({
    taxon: Number,
    root: String,
    superkingdom: String,
    kingdom: String,
    phylum: String,
    class: String,
    order: String,
    family: String,
    genus: String,
    species: String
});

export interface ITaxonomyAbundance extends common.ITaxonomyAbundance, mongoose.Document 
{
    taxline: ITaxLine;
}

export interface ITaxonomyAbundanceProfile extends common.ITaxonomyAbundanceProfile, mongoose.Document {
    experiment: mongoose.Types.ObjectId,
    abundance: mongoose.Types.DocumentArray<ITaxonomyAbundance>;
}

export const taxonomyAbundanceSchema = new mongoose.Schema({
    taxon: {
        type: Number,
        required: true
    },
    count: {
        type: Number,
        required: true
    },
    taxline: {
        type: taxlineSchema,
        required: true
    }
});

export class TaxonomyAbundanceProfileModel {
    public static schema = new mongoose.Schema({
        experiment: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Experiment'
        },
        abundance: {
            type: [taxonomyAbundanceSchema],
            required: true
        }
    });

    private static _model =
    mongoose.model<ITaxonomyAbundanceProfile>('TaxonomyAbundanceProfile', TaxonomyAbundanceProfileModel.schema);
    public static repo = new RepositoryBase<ITaxonomyAbundanceProfile>(TaxonomyAbundanceProfileModel._model);

    public static makeTaxonomyProfile = (experimentId: mongoose.Types.ObjectId, cb?: (id: mongoose.Types.ObjectId) => void) => {
        //Collection is empty
        //build fomr file
        fs.readFile(__dirname + "/taxprofile.csv", 'utf8', function (err, data) {
            if (err) throw err;
            const rawTaxAbundance = csvJSON(data);
            let taxaAbundance = new Array<ITaxonomyAbundance>();
            for (const line of rawTaxAbundance) {
                taxaAbundance.push(<any>{
                    count: line.count,
                    taxon: line.taxon,
                    taxline: {
                        taxon: line.taxon,
                        root: line.root,
                        superkingdom: line.superkingdom,
                        kingdom: line.kingdom,
                        phylum: line.phylum,
                        class: line.class,
                        order: line.order,
                        family: line.family,
                        genus: line.genus,
                        species: line.species,
                    }
                });
            }
            let abundance = <ITaxonomyAbundanceProfile>{
                experiment: experimentId,
                abundance: taxaAbundance
            };
            TaxonomyAbundanceProfileModel.repo.create(abundance, (err, doc) => {
                if (err) throw err;
                ExperimentModel.repo.findById(experimentId, (err: any, experiment: IExperimentModel) => {
                    if (err) {
                        console.log(err);
                        throw err;
                    }

                    if (experiment.results)
                        experiment.results.taxonomyAbundanceProfile = doc._id;
                    else
                        experiment.results = <any>{ taxonomyAbundanceProfile: doc._id };

                    experiment.save((err: any, res: IExperimentModel) => {
                        if( err ) throw err;
                        if (cb) cb(doc._id);
                    });
                });
            });
        });
    }
    public static reset = (experimentId: mongoose.Types.ObjectId, cb?: any) => {
        TaxonomyAbundanceProfileModel.repo.drop((err: any) => {
            if (err) throw err;
            console.log("TaxonomyAbundanceProfile cleared");
            TaxonomyAbundanceProfileModel.repo.findOne({}, (err: any, doc: any) => {
                if (!doc) {
                    TaxonomyAbundanceProfileModel.makeTaxonomyProfile( experimentId , cb );
                }
            });
        });
    };
}
