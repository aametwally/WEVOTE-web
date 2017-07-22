import * as Defs from './model';
import * as mongoose from 'mongoose';

export interface IReadsModel extends mongoose.Document {
    name: String ;
    description: String;
    onServer: Boolean;
    uri: String;
    data: String;
    size: Number ;
    count: Number;
}

export class ReadsModel
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
        size: Number ,
        count: Number
    });

    private static _model = mongoose.model<IReadsModel>('Reads', ReadsModel.schema );
    public static repo = new Defs.RepositoryBase<IReadsModel>( ReadsModel._model );
}
