import * as Defs from './model';
import * as mongoose from 'mongoose';

export interface ITaxonomyModel extends mongoose.Document {
    name: String ,
    description: String,
    onServer: Boolean
    uri: String
    data: String
    size: Number 
}

export class TaxonomyModel
{
    public static schema = new Defs.Schema({
        name: String ,
        description: {
            type: String,
            default:""
        },
        onServer: {
            type: Boolean ,
            default: true
        } ,
        uri: {
            type: String,
            default:""
        },
        data: {
            type: String,
            default:""
        } ,
        size: Number 
    });

    private static _model = mongoose.model<ITaxonomyModel>('Taxonomy', TaxonomyModel.schema );
    public static repo = new Defs.RepositoryBase<ITaxonomyModel>( TaxonomyModel._model );
}
