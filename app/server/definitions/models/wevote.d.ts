/// <reference types="mongoose" />
import { RepositoryBase } from './model';
import * as mongoose from 'mongoose';
import { IExperimentModel } from './experiment';
export interface IWevoteSubmitEnsemble {
    jobID: string;
    reads: IWevoteClassification[];
    score: number;
    penalty: number;
    minNumAgreed: number;
}
export interface IWevoteClassification extends mongoose.Document {
    seqId: string;
    votes: mongoose.Types.Array<number>;
    resolvedTaxon?: number;
    numToolsReported?: number;
    numToolsAgreed?: number;
    numToolsUsed?: number;
    score?: number;
}
export interface IWevoteClassificationPatch extends mongoose.Document {
    experiment: mongoose.Types.ObjectId;
    numToolsUsed: number;
    patch: mongoose.Types.Array<IWevoteClassification>;
}
export declare const wevoteClassificationSchema: mongoose.Schema;
export declare class WevoteClassificationPatchModel {
    static schema: mongoose.Schema;
    private static _model;
    static repo: RepositoryBase<IWevoteClassificationPatch>;
    static parseUnclassifiedEnsemble: (file: string) => IWevoteClassification[];
    static makeWevoteSubmission: (experiment: IExperimentModel, cb: (wevoteSubmission: IWevoteSubmitEnsemble) => void) => void;
}
