import * as Defs from './model';
import * as mongoose from 'mongoose';

export interface IAlgorithmModel extends mongoose.Document {
    name: string;
    used: boolean;
}

export class AlgorithmModel
{
    public static schema = new Defs.Schema({
        name: String ,
        used: {
            type: Boolean,
            default: true
        }
    });
    private static _model = mongoose.model<IAlgorithmModel>('Algorithm', AlgorithmModel.schema );
    public static repo = new Defs.RepositoryBase<IAlgorithmModel>( AlgorithmModel._model );
}
