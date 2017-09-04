/// <reference types="mongoose" />
import { RepositoryBase } from './model';
import * as mongoose from 'mongoose';
export interface IAlgorithmModel extends mongoose.Document {
    name: string;
    used: boolean;
}
export declare class AlgorithmModel {
    static schema: mongoose.Schema;
    private static _model;
    static repo: RepositoryBase<IAlgorithmModel>;
    static reset: () => void;
}
