import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';

export interface IReadsModel extends mongoose.Document {
    name: String;
    description: String;
    onServer: Boolean;
    uri: String;
    data: String;
    size: Number;
    count: Number;
}

export class ReadsModel {
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
        size: Number,
        count: Number
    });

    private static _model = mongoose.model<IReadsModel>('Reads', ReadsModel.schema);
    public static repo = new RepositoryBase<IReadsModel>(ReadsModel._model);

    public static reset = () => {
        ReadsModel.repo.drop(function (err: any) {
            if (err) throw err;
            console.log("Reads cleared");
            ReadsModel.repo.findOne({}, function (err: any, doc: any) {
                if (!doc) {
                    //Collection is empty
                    //build fomr file
                    fs.readFile(__dirname + "/reads.json", 'utf8', function (err, data) {
                        if (err) throw err;
                        let datafromfile = JSON.parse(data);
                        datafromfile.forEach(function (obj: any) {
                            ReadsModel.repo.create(obj, function (err, doc) {
                                if (err) throw err;
                                // console.log("Add reads: " + doc);
                            });
                        })
                    });
                }
            });
        });
    }
}
