/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { ITaxLine, TaxLineModel, ITaxon, taxonSchema } from './taxline';
export interface ITaxonomyAbundance extends mongoose.Document {
    taxon: Number;
    count: Number;
    taxline: mongoose.Schema.Types.ObjectId;
}

export interface ITaxonomyAbundanceProfileModel extends mongoose.Document {
    experiment: mongoose.Schema.Types.ObjectId,
    taxa_abundance: mongoose.Types.DocumentArray<ITaxonomyAbundance>;
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxLine'
    }
});

export class TaxonomyAbundanceProfileModel {
    public static schema = new mongoose.Schema({
        experiment: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Experiment'
        },
        taxa_abundance: {
            type: [taxonomyAbundanceSchema],
            required: true
        }
    });

    private static _model =
    mongoose.model<ITaxonomyAbundanceProfileModel>('TaxonomyAbundanceProfile', TaxonomyAbundanceProfileModel.schema);
    public static repo = new RepositoryBase<ITaxonomyAbundanceProfileModel>(TaxonomyAbundanceProfileModel._model);

    public static reset = (experimentId: string , cb?: any) => {
        TaxonomyAbundanceProfileModel.repo.drop( (err: any) => {
            if (err) throw err;
            console.log("TaxonomyAbundanceProfile cleared");
            TaxonomyAbundanceProfileModel.repo.findOne({}, (err: any, doc: any) => {
                if (!doc) {
                    //Collection is empty
                    //build fomr file
                    fs.readFile(__dirname + "/taxprofile.csv", 'utf8', function (err, data) {
                        if (err) throw err;

                        let abundance = {
                            experiment: experimentId,
                            taxa_abundance: csvJSON(data)
                        };
                        TaxonomyAbundanceProfileModel.repo.create(<any>abundance,  (err, doc) => {
                            if (err) throw err;
                            if (cb) cb( doc._id );
                            // console.log("Add taxonomy abundance: " + doc);
                        });
                    })
                }
            });
        });
    };
}
