/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { ITaxonomyAbundance } from './taxprofile';

export interface IWevoteClassification extends mongoose.Document {
    seqId: string,
    taxa: mongoose.Types.Array<Number>,
    resolvedTaxon: Number,
    numToolsReported: Number,
    numToolsAgreed: Number,
    score: Number,
    // resolvedTaxonline: mongoose.Schema.Types.ObjectId
}

export interface IWevoteClassificationPatch extends mongoose.Document {
    experiment: mongoose.Schema.Types.ObjectId,
    numToolsUsed: Number,
    patch: mongoose.Types.Array<IWevoteClassification>
}

export const wevoteClassificationSchema = new mongoose.Schema({
    seqId: {
        type: String,
        required: true
    },
    taxa: {
        type: [Number],
        required: true
    },
    resolvedTaxon: {
        type: Number,
        required: true,
        default: 0
    },
    numToolsReported: {
        type: Number,
        required: true
    },
    numToolsAgreed: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    // resolvedTaxonline: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'TaxLine',
    //     required: true
    // }
});


export class WevoteClassificationPatchModel {
    public static schema = new mongoose.Schema({
        experiment: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Experiment',
            required: true 
        },
        numToolsUsed: { 
            type : Number,
            required: true 
        },
        patch: { 
            type: [wevoteClassificationSchema],
            required: true 

        }
    });

    private static _model =
    mongoose.model<IWevoteClassificationPatch>('WevoteClassificationPatch', WevoteClassificationPatchModel.schema);
    public static repo = new RepositoryBase<IWevoteClassificationPatch>(WevoteClassificationPatchModel._model);

    public static reset = ( experimentId : mongoose.Schema.Types.ObjectId , cb?: any ) => 
    {
        WevoteClassificationPatchModel.repo.drop(function (err: any) {
            if (err) throw err;
            console.log("WevoteClassificationPatch cleared");
            WevoteClassificationPatchModel.repo.findOne({}, function (err: any, doc: any) {
                if (!doc) {
                    //Collection is empty
                    //build fomr file
                    fs.readFile(__dirname + "/wevote.csv", 'utf8', function (err, data) {
                        if (err) throw err;
                        let wevoteOutputData = csvJSON( data );
                        wevoteOutputData.forEach( function(readInfo:any){
                            readInfo.taxa = [ readInfo.tool0 , readInfo.tool1 , readInfo.tool2 ];
                        });
                        let numToolsUsed = wevoteOutputData[0].numToolsUsed;

                        const wevotePatch: IWevoteClassificationPatch = <any>{ 
                            experiment: experimentId ,
                            numToolsUsed: numToolsUsed ,
                            patch: <any> wevoteOutputData 
                         };
                        WevoteClassificationPatchModel.repo.create(wevotePatch, function (err, doc) {
                            if (err) throw err;
                            if( cb ) cb( doc._id );
                            // console.log("Add taxonomy abundance: " + doc);
                        });
                    })
                }
            });
        });
    }
}
