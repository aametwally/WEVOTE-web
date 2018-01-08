/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { ITaxonomyAbundance } from './taxprofile';
import { IExperimentModel, statusSchema } from './experiment';
const config = require('../config');
import * as common from '../common/common';

export interface IWevoteClassification extends common.IWevoteClassification, mongoose.Document {
    votes: mongoose.Types.Array<number>,
    distances: mongoose.Types.Array<number>
}

export interface IWevoteClassificationPatch extends common.IWevoteClassificationPatch, mongoose.Document {
    experiment: mongoose.Types.ObjectId,
    patch: mongoose.Types.Array<IWevoteClassification>
    distances: mongoose.Types.Array<number>
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
    WEVOTE: {
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
    },
    distances: {
        type: [Number]
    },
    cost: {
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
        },
        status: {
            type: statusSchema
        },
        distances: {
            type: [Number]
        }

    });

    private static _model =
    mongoose.model<IWevoteClassificationPatch>('WevoteClassificationPatch', WevoteClassificationPatchModel.schema);
    public static repo = new RepositoryBase<IWevoteClassificationPatch>(WevoteClassificationPatchModel._model);

    public static isClassified = (headerLine: string, sep: string = ','): boolean => {
        const tokens = headerLine.trim().split(sep);
        if (WevoteClassificationPatchModel.isHeaderLine(headerLine))
            return tokens.reduce((previous: boolean, current: string) => {
                return previous || current === 'WEVOTE';
            }, false);
        /** If tokens are greater than 7 fields, then it is a classified read.*/
        else return tokens.length >= 7; /** TODO: eleminate this magic number. */
    };

    public static isHeaderLine = (line: string, sep: string = ','): boolean => {
        const tokens = line.trim().split(sep);
        return tokens[0] === 'seqId';
    };

    public static extractAlgorithms = (headerLine: string, sep: string = ','): string[] => {
        const tokens = headerLine.trim().split(sep);

        if (WevoteClassificationPatchModel.isHeaderLine(headerLine)) {
            if (WevoteClassificationPatchModel.isClassified(headerLine))
                return tokens.slice( 4, tokens.indexOf('WEVOTE') );
            else 
                return tokens.slice( 1 );
        }
        else
            throw Error("files must include header line");
    };

    public static parseUnclassifiedEnsemble = (file: string): Array<IWevoteClassification> => {
        let array = new Array<IWevoteClassification>();
        const lines = file.split('\n').slice(1);
        lines.forEach((line: string) => {
            const tokens: string[] = line.trim().split(",");
            if (tokens.length <= 1) return;
            const seqId = tokens[0];
            const votes = tokens.slice(1).map((val: string) => { return parseInt(val, 10); });
            array.push(<IWevoteClassification>{ seqId: seqId, votes: votes });
        });
        return array;
    }

    public static makeWevoteSubmission =
    (experiment: IExperimentModel, cb: (wevoteSubmission: common.IWevoteSubmitEnsemble) => void) => {
        fs.readFile(__dirname + '/MiSeq_accuracy_ensemble_blast_kraken_tipp_clark_metaphlan.csv', 'utf8', (err: any, data: string) => {
            if (err) throw err;
            let unclassifiedReads = WevoteClassificationPatchModel.parseUnclassifiedEnsemble(data);

            const port = (process.env.WEVOTE_WEB_PORT === 'undefined')? config.port : parseInt( <string>process.env.WEVOTE_WEB_PORT );
            const submission: common.IWevoteSubmitEnsemble = {
                jobID: experiment._id,
                resultsRoute: {
                    host: config.localhost,
                    port: port,
                    relativePath: '/experiment/classification'
                },
                status: <any>{},
                reads: unclassifiedReads,
                abundance: [],
                sequences: [],
                algorithms: ["BLASTN", "KRAKEN", "TIPP", "CLARK", "MetaPhlAn"],
                score: experiment.config.minScore,
                penalty: experiment.config.penalty,
                minNumAgreed: experiment.config.minNumAgreed,
                distances: <any>[]
            };
            cb(submission);
        });
    }
}