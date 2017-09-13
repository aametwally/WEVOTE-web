// grab the things we need
import { AlgorithmModel, IAlgorithmModel } from './algorithm';
import { ReadModel  } from './reads';
import { EnsembleFileModel } from './ensemblefile';
import { TaxonomyModel } from './taxonomy';
import { IRemoteFile , RemoteFileModel } from './remotefile';
import { WevoteClassificationPatchModel, IWevoteClassificationPatch } from './wevote';
import { TaxonomyAbundanceProfileModel, ITaxonomyAbundanceProfileModel } from './taxprofile';
import { RepositoryBase, csvJSON } from './model';
import { IUserModel } from './user';
import * as mongoose from 'mongoose';


export enum Status {
    NOT_STARTED , 
    IN_PROGRESS ,
    SUCCSESS ,
    FAILURE
}

export interface IStatus extends mongoose.Document {
    code: Status,
    message: string,
    progress?: number
}


export interface IConfig extends mongoose.Document {
    algorithms: mongoose.Types.DocumentArray<IAlgorithmModel>;
    minNumAgreed: number;
    minScore: number;
    penalty: number;
}

export interface IResults extends mongoose.Document {
    wevoteClassification: mongoose.Types.ObjectId,
    taxonomyAbundanceProfile: mongoose.Types.ObjectId
}

export interface IUsageScenario extends mongoose.Document {
    value: string , 
    usage: string , 
    hint?: string
}

export interface IExperimentModel extends mongoose.Document {
    user: mongoose.Types.ObjectId;
    isPrivate: Boolean;
    email: string;
    description: string;
    reads: IRemoteFile;
    taxonomy: IRemoteFile;
    ensemble: IRemoteFile;
    config: IConfig;
    status: IStatus;
    results?: IResults;
    usageScenario: IUsageScenario;
    createdAt?: Date;
    modifiedAt?: Date;
}

const configSchema = new mongoose.Schema({
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

const statusSchema = new mongoose.Schema({
    code: Number,
    message: String,
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
});

const resultsSchema = new mongoose.Schema({
    wevoteClassification: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WevoteClassificationPatch'
    },
    taxonomyAbundanceProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxonomyAbundanceProfile'
    }
});

const usageScenarioSchema = new mongoose.Schema({
    value: String , 
    usage: String ,
    hint: String 
});

export class ExperimentModel {
    public static schema = new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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
            type: ReadModel.schema 
        },
        taxonomy: {
            type: TaxonomyModel.schema,
            required: true
        },
        ensemble: {
            type: EnsembleFileModel.schema
        },
        config: configSchema,
        status: statusSchema,
        results: resultsSchema,
        usageScenario: usageScenarioSchema
    }, {
            timestamps: true
        });
    private static _model = mongoose.model<IExperimentModel>('Experiment', ExperimentModel.schema);
    public static repo = new RepositoryBase<IExperimentModel>(ExperimentModel._model);

    public static reset = (userId: mongoose.Types.ObjectId, cb: (exp:IExperimentModel) => void ) => {
        ExperimentModel.repo.drop((err: any) => {
            if (err) throw err;
            console.log("ExperimentModel cleared");
            ExperimentModel.repo.findOne({}, (err: any, doc: any) => {
                if (!doc) {
                    //Collection is empty
                    const _reads: IRemoteFile = <any>{
                        name: "todo",
                        description: "todo:somDesc",
                        onServer: true,
                        uri: "todo",
                        data: "todo",
                        size: 0,
                        count: 0
                    };
                    const _taxonomy: IRemoteFile = <any>{
                        name: "todo",
                        description: "todo",
                        onServer: true,
                        uri: "todo",
                        data: "todo",
                        size: 0
                    };
                    const _ensemble: IRemoteFile = <any>{
                        name: "todo",
                        description: "todo",
                        onServer: false,
                        uri: "todo",
                        data: "todo",
                        size: 0
                    }

                    const _config: IConfig = <any>{
                        algorithms: [
                            { name: "ALG0", used: true },
                            { name: "ALG1", used: true },
                            { name: "ALG2", used: true },
                        ],
                        minScore: 0,
                        minNumAgreed: 0,
                        penalty: 2
                    };

                    ExperimentModel.repo.create(<any>{
                        user: userId,
                        isPrivate: true,
                        email: "asem_alla@msn.com",
                        description: "todo",
                        usageScenario: <IUsageScenario>{ value: "classificationFromEnsemble" ,  usage: "Classification" },
                        reads: _reads,
                        ensemble: _ensemble,
                        taxonomy: _taxonomy,
                        status: <IStatus> { code: Status.NOT_STARTED , message: Status[Status.NOT_STARTED] },
                        config: _config
                    }, (err: any, exp: any) => {
                        if (err) {
                            console.log("Error:" + err);
                            throw err;
                        }
                        console.log("experiment posted!:" + exp);
                        cb( exp );
                    });

                }
            });
        });
    }
}
