import { AlgorithmModel } from './algorithm';
import { ReadModel } from './reads';
import { ExperimentModel, IExperimentModel } from './experiment';
import { TaxonomyAbundanceProfileModel } from './taxprofile';
import { UserModel } from './user';
import { WevoteClassificationPatchModel } from './wevote';
import * as mongoose from 'mongoose';
export let init = function ( cb : (experiment:IExperimentModel) => void ) {

    AlgorithmModel.reset();
    ReadModel.reset();
    // User -> Experiment -> {Wevote, taxProfile}.
    UserModel.reset(function (
        userId: mongoose.Types.ObjectId ) {
        ExperimentModel.reset(
            userId, cb );
    });
};