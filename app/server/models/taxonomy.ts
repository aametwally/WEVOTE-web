import * as Defs from './model';
import * as mongoose from 'mongoose';
import {RemoteFileModel,IRemoteFile} from './remotefile';


export class TaxonomyModel extends RemoteFileModel
{
    protected static _taxonomyModel = mongoose.model<IRemoteFile>('Taxonomy', RemoteFileModel.schema );
    public static repo = new Defs.RepositoryBase<IRemoteFile>( TaxonomyModel._taxonomyModel );
}
