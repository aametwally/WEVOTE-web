// grab the things we need
import {AlgorithmModel,IAlgorithmModel} from './algorithm';
import {ReadsModel,IReadsModel} from './reads';
import {TaxonomyModel,ITaxonomyModel} from './taxonomy';
import * as Defs from './model';
import * as mongoose from 'mongoose';


export interface IStatus extends mongoose.Document {
    started: Boolean;
    progress: Number;
}


export interface IConfig extends mongoose.Document {
    algorithms: mongoose.Types.DocumentArray<IAlgorithmModel>;
    minNumAgreed: Number;
    minScore: Number;
    penalty: Number;
}

export interface IExperimentModel extends mongoose.Document {
    user: String;
    isPrivate: Boolean;
    email: String;
    description: String;
    reads: IReadsModel;
    taxonomy: ITaxonomyModel;
    config: IConfig;
    status: IStatus;
    createdAt: Date;
    modifiedAt: Date;
}


let configSchema = new Defs.Schema({
    algorithms: {
        type: [AlgorithmModel.schema],
        required: true
    },
    minNumAgreed: {
        type: Number,
        min: 0,
        default: 0
    },
    minScore: {
        type: Number,
        min: 0,
        default: 0
    },
    penalty: {
        type: Number,
        default: 2
    }
});

let statusSchema = new Defs.Schema({
    started: Boolean,
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default:0
    }
});

export class ExperimentModel
{
    public static schema = new Defs.Schema({
        user: {
            type: String,
            required: true,
            default: "public"
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        email: {
            type: String
        },
        description: {
            type: String
        },
        reads: {
            type: ReadsModel.schema,
            required: true
        },
        taxonomy: {
            type: TaxonomyModel.schema,
            required: true
        },
        config: configSchema,
        status: statusSchema
    }, {
        timestamps: true
    });
    private static _model = mongoose.model<IExperimentModel>('Experiment', ExperimentModel.schema );
    public static repo = new Defs.RepositoryBase<IExperimentModel>( ExperimentModel._model );
}
