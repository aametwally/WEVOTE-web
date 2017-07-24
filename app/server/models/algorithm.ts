import { RepositoryBase, csvJSON } from './model';
import * as fs from 'fs';
import * as mongoose from 'mongoose';

export interface IAlgorithmModel extends mongoose.Document {
    name: string;
    used: boolean;
}

export class AlgorithmModel {
    public static schema = new mongoose.Schema({
        name: String,
        used: {
            type: Boolean,
            default: true
        }
    });
    private static _model = mongoose.model<IAlgorithmModel>('Algorithm', AlgorithmModel.schema);
    public static repo = new RepositoryBase<IAlgorithmModel>(AlgorithmModel._model);

    public static reset = () => {
        AlgorithmModel.repo.drop(function (err: any) {
            if (err) throw err;
            console.log("Algorithm cleared");
            //To initialize when the collection is empty
            AlgorithmModel.repo.findOne({}, function (err, doc) {
                if (!doc) {
                    //Collection is empty
                    //build fomr file
                    fs.readFile(__dirname + "/algorithm.json", 'utf8', function (err, data) {
                        if (err) throw err;
                        let datafromfile = JSON.parse(data);
                        datafromfile.forEach(function (obj: any) {
                            AlgorithmModel.repo.create(obj, function (err, doc) {
                                if (err) throw err;
                                // console.log("Add algorithm: " + doc);
                            });
                        })
                    });
                }
            });
        });
    }
}
