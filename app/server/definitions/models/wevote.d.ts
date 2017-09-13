/// <reference types="mongoose" />
import { RepositoryBase } from './model';
import * as mongoose from 'mongoose';
import { IExperimentModel } from './experiment';
export interface IRemoteAddress {
    host: string;
    port: number;
    relativePath: string;
}
export declare enum EWevoteClassificationStatus {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    SUCCESS = 2,
    FAILURE = 3,
}
export interface IWevoteClassificationStatus extends mongoose.Document {
    status: string;
    percentage: number;
}
export interface IWevoteSubmitEnsemble {
    jobID: string;
    resultsRoute: IRemoteAddress;
    reads: IWevoteClassification[];
    status: IWevoteClassificationStatus;
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
    patch: mongoose.Types.Array<IWevoteClassification>;
    status: IWevoteClassificationStatus;
}
export declare const wevoteClassificationStatusSchema: mongoose.Schema;
export declare const wevoteClassificationSchema: mongoose.Schema;
export declare class WevoteClassificationPatchModel {
    static schema: mongoose.Schema;
    private static _model;
    static repo: RepositoryBase<IWevoteClassificationPatch>;
    static parseUnclassifiedEnsemble: (file: string) => IWevoteClassification[];
    static makeWevoteSubmission: (experiment: IExperimentModel, cb: (wevoteSubmission: IWevoteSubmitEnsemble) => void) => void;
}
