/// <reference types="mongoose" />
import { IAlgorithmModel } from './algorithm';
import { IRemoteFile } from './remotefile';
import { RepositoryBase } from './model';
import * as mongoose from 'mongoose';
export declare enum EStatus {
    NOT_STARTED = 0,
    IN_PROGRESS = 1,
    SUCCSESS = 2,
    FAILURE = 3,
}
export interface IStatus extends mongoose.Document {
    code: EStatus;
    message: string;
    percentage: number;
}
export interface IConfig extends mongoose.Document {
    algorithms: IAlgorithmModel[];
    minNumAgreed: number;
    minScore: number;
    penalty: number;
}
export interface IResults extends mongoose.Document {
    wevoteClassification: mongoose.Types.ObjectId;
    taxonomyAbundanceProfile: mongoose.Types.ObjectId;
}
export interface IUsageScenario extends mongoose.Document {
    value: string;
    usage: string;
    hint?: string;
}
export interface IExperimentModel extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    isPrivate: boolean;
    email: string;
    description: string;
    reads: IRemoteFile;
    taxonomy: IRemoteFile;
    ensemble: IRemoteFile;
    config: IConfig;
    status: IStatus;
    results?: IResults;
    usageScenario: IUsageScenario;
    createdAt?: Date;
    modifiedAt?: Date;
}
export declare const statusSchema: mongoose.Schema;
export declare class ExperimentModel {
    static schema: mongoose.Schema;
    private static _model;
    static repo: RepositoryBase<IExperimentModel>;
    static reset: (userId: mongoose.Types.ObjectId, cb: (exp: IExperimentModel) => void) => void;
}
