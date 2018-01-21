// grab the things we need
import { AlgorithmModel, IAlgorithm } from './algorithm';
import { ReadModel  } from './reads';
import { IRemoteFile , RemoteFileModel } from './remotefile';
import { WevoteClassificationPatchModel, IWevoteClassificationPatch } from './wevote';
import { TaxonomyAbundanceProfileModel, ITaxonomyAbundanceProfile } from './taxprofile';
import { RepositoryBase, csvJSON } from './model';
import { IUserModel } from './user';
import * as mongoose from 'mongoose';
import * as common from '../common/common';

export interface IConfig extends  common.IConfig, mongoose.Document {
    algorithms: IAlgorithm[];
}

export interface IResults extends common.IResults, mongoose.Document {
    wevoteClassification: mongoose.Types.ObjectId,
    taxonomyAbundanceProfile: mongoose.Types.ObjectId
}

export interface IUsageScenario extends common.IUsageScenario, mongoose.Document {

}

export interface IExperimentModel extends common.IExperiment, mongoose.Document {
    user: mongoose.Types.ObjectId;
    config: IConfig;
    results?: IResults;
    usageScenario: IUsageScenario;
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

export const statusSchema = new mongoose.Schema({
    code: {
        type: Number,
        default: common.EStatus.NOT_STARTED
    },
    message: {
        type: String,
        default: common.EStatus[ common.EStatus.NOT_STARTED ]
    },
    percentage: {
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
        email: {
            type: String
        },
        description: {
            type: String
        },
        reads: {
            type: ReadModel.schema 
        },
        config: {
            type: configSchema
        },
        status: {
            type: statusSchema
        },
        results: {
            type: resultsSchema
        },
        usageScenario: 
        {
            type: usageScenarioSchema
        }
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

                    const _config: IConfig = <any>{
                        algorithms: [
                            { name: "BLASTN", used: true },
                            { name: "KRAKEN", used: true },
                            { name: "TIPP", used: true },
                            { name: "CLARK", used: true },
                            { name: "MetaPhlAn", used: true },
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
                        status: <common.IStatus> { code: common.EStatus.NOT_STARTED , message: common.EStatus[common.EStatus.NOT_STARTED] },
                        config: _config
                    }, (err: any, exp: any) => {
                        if (err) {
                            console.log("Error:" + err);
                            throw err;
                        }
                        cb( exp );
                    });

                }
            });
        });
    }
}
