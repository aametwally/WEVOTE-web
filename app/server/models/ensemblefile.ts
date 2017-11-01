import * as Defs from './model';
import * as mongoose from 'mongoose';
import {RemoteFileModel,IRemoteFile} from './remotefile';


export class EnsembleFileModel extends RemoteFileModel
{
    protected static _ensemblefileModel = mongoose.model<IRemoteFile>('EnsembleFiles', RemoteFileModel.schema );
    public static repo = new Defs.RepositoryBase<IRemoteFile>( EnsembleFileModel._ensemblefileModel );
}
