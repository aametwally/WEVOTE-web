/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { ITaxonomyAbundance } from './taxprofile';

export interface IWevoteClassification extends mongoose.Document {
    seqId: string,
    votes: mongoose.Types.Array<number>,
    resolvedTaxon?: number,
    numToolsReported?: number,
    numToolsAgreed?: number,
    numToolsUsed?: number,
    score?: number
}

export interface IWevoteClassificationPatch extends mongoose.Document {
    experiment: mongoose.Schema.Types.ObjectId,
    numToolsUsed: number,
    patch: mongoose.Types.Array<IWevoteClassification>
}

export const wevoteClassificationSchema = new mongoose.Schema({
    seqId: {
        type: String,
        required: true
    },
    votes: {
        type: [Number],
        required: true
    },
    resolvedTaxon: {
        type: Number
    },
    numToolsReported: {
        type: Number
    },
    numToolsAgreed: {
        type: Number
    },
    numToolsUsed: {
        type: Number 
    },
    score: {
        type: Number
    }
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

    public static reset = ( experimentId : string , cb?: any ) => 
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
                            readInfo.votes = [ readInfo.tool0 , readInfo.tool1 , readInfo.tool2 ];
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
                            // console.log("Wevote Classification Added: " + doc);
                        });
                    })
                }
            });
        });
    }
}
