import { AlgorithmModel } from './algorithm';
import { ReadsModel } from './reads';
import { ExperimentModel } from './experiment';
import { TaxonomyAbundanceProfileModel } from './taxprofile';
import { UserModel } from './user';
import {WevoteClassificationPatchModel} from './wevote';
import * as mongoose from 'mongoose';
export let init = function () {

    AlgorithmModel.reset();
    ReadsModel.reset();
    // User -> Experiment -> {Wevote, taxProfile}.
    UserModel.reset( function( 
        userId: mongoose.Schema.Types.ObjectId){
            ExperimentModel.reset(
                userId , 
                function( experimentId: mongoose.Schema.Types.ObjectId ){
                    WevoteClassificationPatchModel.reset( experimentId );
                    TaxonomyAbundanceProfileModel.reset( experimentId );
                })
        });
};