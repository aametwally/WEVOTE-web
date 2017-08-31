import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';

export interface IRemoteFile extends mongoose.Document {
    name: String,
    description: String,
    onServer: Boolean,
    uri: String,
    data: String,
    size: Number,
    tag?:String,
    count?: Number
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
        uri: {
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
