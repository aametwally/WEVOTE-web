/**
 * Created by warsha on 01/07/2017.
 */
import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import { ITaxonomyAbundanceModel } from './taxprofile';
import { IExperimentModel, EStatus, IStatus, statusSchema } from './experiment';
import { config } from '../config';

export interface IRemoteAddress {
    host: string,
    port: number,
    relativePath: string
}

export interface IWevoteSubmitEnsemble {
    jobID: string,
    resultsRoute: IRemoteAddress,
    reads: IWevoteClassification[],
    status: IStatus,
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
    patch: mongoose.Types.Array<IWevoteClassification>,
    status: IStatus
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
        },
        status: {
            type: statusSchema
        }

    });

    private static _model =
    mongoose.model<IWevoteClassificationPatch>('WevoteClassificationPatch', WevoteClassificationPatchModel.schema);
    public static repo = new RepositoryBase<IWevoteClassificationPatch>(WevoteClassificationPatchModel._model);

    public static isClassified = (headerLine: string, sep: string = ','): boolean => {
        const tokens = headerLine.trim().split(sep);
        if (WevoteClassificationPatchModel.isHeaderLine(headerLine))
            return tokens.reduce((previous: boolean, current: string) => {
                return previous || current === 'resolvedTaxon';
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
                return tokens.slice(5, -1);
            else
                return tokens.slice(1);
        }
        else {
            let algorithmsCount = 0;
            if (WevoteClassificationPatchModel.isClassified(headerLine))
                algorithmsCount = tokens.length - 6; /** TODO: eliminate this magic number. */
            else
                algorithmsCount = tokens.length - 1;

            let i = 0;
            let algorithms = new Array<string>();
            while (i++ < algorithmsCount)
                algorithms.push(`ALG${i}`);
            return algorithms;
        }
    };

    public static parseUnclassifiedEnsemble = (file: string): Array<IWevoteClassification> => {
        let array = new Array<IWevoteClassification>();
        const lines = file.split('\n');
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
                    host: config.host,
                    port: config.port,
                }

            const submission: IWevoteSubmitEnsemble = {
                jobID: experiment._id,
                resultsRoute: {
                    host: config.host,
                    port: config.port,
                    relativePath: '/experiment/classification'
                },
                status: <any>{},
                reads: unclassifiedReads,
                score: experiment.config.minScore,
                penalty: experiment.config.penalty,
                minNumAgreed: experiment.config.minNumAgreed
            };
            cb(submission);
        });
    }
}