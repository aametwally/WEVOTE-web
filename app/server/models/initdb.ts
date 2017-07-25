import { AlgorithmModel } from './algorithm';
import { ReadsModel } from './reads';
import { ExperimentModel, IExperimentModel } from './experiment';
import { TaxonomyAbundanceProfileModel } from './taxprofile';
import { UserModel } from './user';
import { WevoteClassificationPatchModel } from './wevote';
import * as mongoose from 'mongoose';
export let init = function () {

    AlgorithmModel.reset();
    ReadsModel.reset();
    // User -> Experiment -> {Wevote, taxProfile}.
    UserModel.reset(function (
        userId: string) {
        ExperimentModel.reset(
            userId,
            function (experimentId: string) {
                WevoteClassificationPatchModel.reset(experimentId,
                    (wevoteId: string) => {
                        ExperimentModel.repo.findById(experimentId, (err: any, experiment: IExperimentModel) => {
                            if (err) {
                                console.log("Error:", err);
                                throw err;
                            }
                            experiment.results.wevoteClassification = <any> wevoteId;
                            experiment.save((err: any, doc: any) => {
                                if (err)
                                    throw err;
                                console.log("updated Experiment" + doc);
                            });
                        });
                    });
                TaxonomyAbundanceProfileModel.reset(experimentId, (taxproId: string) => {
                    ExperimentModel.repo.findById(experimentId, (err: any, experiment: IExperimentModel) => {
                        if (err) {
                            console.log("Error:", err);
                            throw err;
                        }
                        experiment.results.taxonomyAbundanceProfile = <any>taxproId;
                        experiment.save((err: any, doc: any) => {
                            if (err)
                                throw err;
                            console.log("updated Experiment" + doc);
                        });
                    });
                });
            })
    });
};