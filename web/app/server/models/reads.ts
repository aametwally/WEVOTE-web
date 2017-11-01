import { RepositoryBase, csvJSON } from './model';
import { IRemoteFile , RemoteFileModel } from './remotefile';
import * as fs from 'fs';
import * as mongoose from 'mongoose';


export class ReadModel extends RemoteFileModel {
    
    protected static _readModel = mongoose.model<IRemoteFile>('Reads', RemoteFileModel.schema);
    public static repo = new RepositoryBase<IRemoteFile>(ReadModel._readModel);

    public static reset = () => {
        ReadModel.repo.drop( (err: any) => {
            if (err) throw err;
            console.log("Reads cleared");
            ReadModel.repo.findOne({},  (err: any, doc: any) => {
                if (!doc) {
                    //Collection is empty
                    //build fomr file
                    fs.readFile(__dirname + "/reads.json", 'utf8', function (err, data) {
                        if (err) throw err;
                        let datafromfile = JSON.parse(data);
                        datafromfile.forEach(function (obj: any) {
                            ReadModel.repo.create(obj,  (err, doc) => {
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
