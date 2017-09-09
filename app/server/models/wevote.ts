/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { ITaxonomyAbundance } from './taxprofile';
import { IExperimentModel } from './experiment';
import {config} from '../config';
export interface IRemoteAddress 
{
    host: string , 
    port: number , 
    relativePath: string
}

export interface IWevoteSubmitEnsemble {
    jobID: string,
    resultsRoute: IRemoteAddress,
    reads: IWevoteClassification[],
    score: number,
    penalty: number,
    minNumAgreed: number
}

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
    experiment: mongoose.Types.ObjectId,
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
        patch: {
            type: [wevoteClassificationSchema],
            required: true

        }
    });

    private static _model =
    mongoose.model<IWevoteClassificationPatch>('WevoteClassificationPatch', WevoteClassificationPatchModel.schema);
    public static repo = new RepositoryBase<IWevoteClassificationPatch>(WevoteClassificationPatchModel._model);

    public static parseUnclassifiedEnsemble = (file: string): Array<IWevoteClassification> => {
        let array = new Array<IWevoteClassification>();
        const lines = file.split('\n');
        lines.forEach((line: string) => {
            const tokens: string[] = line.trim().split(",");
            if ( tokens.length <= 1 ) return;
            const seqId = tokens[0];
            const votes = tokens.slice(1).map((val: string) => { return parseInt(val, 10); });
            array.push(<IWevoteClassification>{ seqId: seqId, votes: votes });
        });
        return array;
    }

    public static makeWevoteSubmission =
    (experiment: IExperimentModel, cb: (wevoteSubmission: IWevoteSubmitEnsemble) => void) => {
        fs.readFile(__dirname + '/ensemble_unclassified.csv', 'utf8', (err: any, data: string) => {
            if (err) throw err;
            let unclassifiedReads = WevoteClassificationPatchModel.parseUnclassifiedEnsemble(data);

            const wevotePatch = <IWevoteClassificationPatch>{
                experiment: experiment._id,
                patch: <any>unclassifiedReads
            };

            const resultsRoute = 
            {
                host: config.host ,
                port: config.port , 
            }

            const submission: IWevoteSubmitEnsemble = {
                jobID: experiment._id,
                resultsRoute: {
                    host: config.host , 
                    port: config.port , 
                    relativePath: '/experiment/classification'
                },
                reads: unclassifiedReads,
                score: experiment.config.minScore,
                penalty: experiment.config.penalty,
                minNumAgreed: experiment.config.minNumAgreed
            };
            cb( submission );
        });
    }
}