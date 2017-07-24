// grab the things we need
import { AlgorithmModel, IAlgorithmModel } from './algorithm';
import { ReadsModel, IReadsModel } from './reads';
import { TaxonomyModel, ITaxonomyModel } from './taxonomy';
import { WevoteClassificationPatchModel, IWevoteClassificationPatch } from './wevote';
import { TaxonomyAbundanceProfileModel, ITaxonomyAbundanceProfileModel } from './taxprofile';
import { RepositoryBase, csvJSON } from './model';
import { IUserModel } from './user';
import * as mongoose from 'mongoose';


interface IStatus extends mongoose.Document {
    started: Boolean;
    progress: Number;
}


interface IConfig extends mongoose.Document {
    algorithms: mongoose.Types.DocumentArray<IAlgorithmModel>;
    minNumAgreed: Number;
    minScore: Number;
    penalty: Number;
}

interface IResults extends mongoose.Document {
    wevoteClassification: mongoose.Schema.Types.ObjectId,
    taxonomyAbundanceProfile: mongoose.Schema.Types.ObjectId
}

export interface IExperimentModel extends mongoose.Document {
    user: mongoose.Schema.Types.ObjectId;
    isPrivate: Boolean;
    email: String;
    description: String;
    reads: IReadsModel;
    taxonomy: ITaxonomyModel;
    config: IConfig;
    status: IStatus;
    results: IResults;
    createdAt: Date;
    modifiedAt: Date;
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
    started: Boolean,
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
            type: ReadsModel.schema,
            required: true
        },
        taxonomy: {
            type: TaxonomyModel.schema,
            required: true
        },
        config: configSchema,
        status: statusSchema,
        results: resultsSchema
    }, {
            timestamps: true
        });
    private static _model = mongoose.model<IExperimentModel>('Experiment', ExperimentModel.schema);
    public static repo = new RepositoryBase<IExperimentModel>(ExperimentModel._model);

    public static reset = (userId: mongoose.Schema.Types.ObjectId, cb?: any) => {
        ExperimentModel.repo.drop((err: any) => {
            if (err) throw err;
            console.log("ExperimentModel cleared");
            ExperimentModel.repo.findOne({}, (err: any, doc: any) => {
                if (!doc) {
                    //Collection is empty
                    const _reads: IReadsModel = <any>{
                        name: "todo",
                        description: "todo:somDesc",
                        onServer: true,
                        uri: "todo",
                        data: "todo",
                        size: "todo",
                        count: "todo"
                    };
                    const _taxonomy: ITaxonomyModel = <any>{
                        name: "todo",
                        description: "todo",
                        onServer: true,
                        uri: "todo",
                        data: "todo",
                        size: 0
                    };

                    const _config: IConfig = <any>{
                        algorithms: [
                            { name: "tool1", used: true },
                            { name: "tool2", used: true },
                            { name: "tool3", used: true },
                        ],
                        minScore: "0",
                        minNumAgreed: "0",
                        penalty: "0"
                    };

                    ExperimentModel.repo.create(<any>{
                        user: userId,
                        isPrivate: true,
                        email: "asem_alla@msn.com",
                        description: "todo",
                        reads: _reads,
                        taxonomy: _taxonomy,
                        config: _config,
                    }, (err: any, exp: any) => {
                        if (err) {
                            console.log("Error:" + err);
                            throw err;
                        }
                        console.log("experiment posted!:" + exp);
                        const id = exp._id;
                        if (cb) cb(id);
                    });

                }
            });
        });
    }
}
