/// <reference types="mongoose" />
import { RepositoryBase } from './model';
import * as mongoose from 'mongoose';
export interface IRemoteFile extends mongoose.Document {
    name: string;
    description: string;
    onServer: Boolean;
    uri: string;
    data: string;
    size: number;
    tag?: string;
    count?: number;
}
export declare class RemoteFileModel {
    static schema: mongoose.Schema;
    protected static _model: mongoose.Model<IRemoteFile>;
    static repo: RepositoryBase<IRemoteFile>;
}
