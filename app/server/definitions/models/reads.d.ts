/// <reference types="mongoose" />
import { RepositoryBase } from './model';
import { IRemoteFile, RemoteFileModel } from './remotefile';
import * as mongoose from 'mongoose';
export declare class ReadModel extends RemoteFileModel {
    protected static _readModel: mongoose.Model<IRemoteFile>;
    static repo: RepositoryBase<IRemoteFile>;
    static reset: () => void;
}
