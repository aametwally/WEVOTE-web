/// <reference types="mongoose" />
import * as Defs from './model';
import * as mongoose from 'mongoose';
import { RemoteFileModel, IRemoteFile } from './remotefile';
export declare class EnsembleFileModel extends RemoteFileModel {
    protected static _ensemblefileModel: mongoose.Model<IRemoteFile>;
    static repo: Defs.RepositoryBase<IRemoteFile>;
}
