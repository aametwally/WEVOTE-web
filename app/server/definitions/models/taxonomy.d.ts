/// <reference types="mongoose" />
import * as Defs from './model';
import * as mongoose from 'mongoose';
import { RemoteFileModel, IRemoteFile } from './remotefile';
export declare class TaxonomyModel extends RemoteFileModel {
    protected static _taxonomyModel: mongoose.Model<IRemoteFile>;
    static repo: Defs.RepositoryBase<IRemoteFile>;
}
