import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as common from '../common/common';
export interface IRemoteFile extends common.IRemoteFile, mongoose.Document {
}

export class RemoteFileModel {
    public static schema = new mongoose.Schema({
        name: String,
        description: {
            type: String,
            default: ""
        },
        onServer: {
            type: Boolean,
            default: true
        },
        cdnUrl: {
            type: String,
            default: ""
        },
        uuid: {
            type: String,
            default: ""
        },
        data: {
            type: String,
            default: ""
        },
        tag: {
            type: String , 
            default: "read"
        },
        size: Number,
        count: Number
    });

    protected static _model = mongoose.model<IRemoteFile>('RemoteFiles', RemoteFileModel.schema);
    public static repo = new RepositoryBase<IRemoteFile>(RemoteFileModel._model);
}
