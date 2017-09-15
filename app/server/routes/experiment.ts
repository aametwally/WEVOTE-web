import { BaseRoute } from "./route";
import {
    ExperimentModel, IExperimentModel, IConfig,
    IStatus, EStatus, IUsageScenario, IResults
} from '../models/experiment';
import { Request, Response, NextFunction } from 'express';
import { IRemoteFile } from "../models/remotefile";
import { UserModel, IUserModel } from '../models/user';
import {
    IWevoteClassification, IWevoteClassificationPatch,
    IWevoteSubmitEnsemble, IRemoteAddress,
    WevoteClassificationPatchModel
} from '../models/wevote';
import {
    ITaxonomyAbundanceProfileModel,
    TaxonomyAbundanceProfileModel
} from '../models/taxprofile';
import { IAlgorithmModel } from '../models/algorithm';
import { verifyOrdinaryUser } from './verify';
import { UploadRouter } from './upload';
import * as fs from 'fs';
import * as http from 'http';
import { config } from '../config'
import * as mongoose from 'mongoose';

export class ExperimentRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/classification')
            .post(function (req: Request, res: Response, next: NextFunction) {

                const submission = <IWevoteSubmitEnsemble>req.body;
                const expId = mongoose.Types.ObjectId.createFromHexString(submission.jobID);

                const classificationResults: IWevoteClassificationPatch =
                    <any>{
                        experiment: expId,
                        patch: submission.reads,
                        status: submission.status
                    };

                WevoteClassificationPatchModel.repo.create(classificationResults, (err: any, resutls: IWevoteClassificationPatch) => {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    ExperimentModel.repo.findById(expId, (err: any, experiment: IExperimentModel) => {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }

                        experiment.status = resutls.status;

                        if (experiment.results)
                            experiment.results.wevoteClassification = resutls._id;
                        else
                            experiment.results = <any>{ wevoteClassification: resutls._id };

                        experiment.save((err: any, exp: IExperimentModel) => {
                            TaxonomyAbundanceProfileModel.makeTaxonomyProfile(exp._id, (id: mongoose.Types.ObjectId) => {
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                return res.end();
                            })
                        });
                    });
                })
            })
            ;

        this._router.route('/')
            .post(verifyOrdinaryUser,
            (req: any, res: any, next: any) => {
                let exp = <IExperimentModel>req.body;
                const _reads: IRemoteFile = <any>{
                    name: exp.reads.name,
                    description: "reads file",
                    onServer: true,
                    uri: exp.reads.uri,
                    data: exp.reads.data,
                    size: exp.reads.size,
                    count: exp.reads.count
                };
                const _ensemble: IRemoteFile = <any>{
                    name: exp.ensemble.name,
                    description: "ensmble file",
                    onServer: true,
                    uri: exp.ensemble.uri,
                    data: exp.ensemble.data,
                    size: exp.ensemble.size,
                    count: exp.reads.count
                };
                const _taxonomy: IRemoteFile = <any>{
                    name: "taxName",
                    description: "somDesc",
                    onServer: true,
                    uri: "somURI",
                    data: "somData",
                    size: 0
                };
                const _config: IConfig = <any>{
                    algorithms: exp.config.algorithms,
                    minScore: exp.config.minScore,
                    minNumAgreed: exp.config.minNumAgreed,
                    penalty: exp.config.penalty
                };
                ExperimentModel.repo.create(<any>{
                    user: req.decoded._id,
                    isPrivate: exp.isPrivate,
                    email: exp.email,
                    description: exp.description,
                    reads: _reads,
                    taxonomy: _taxonomy,
                    ensemble: _ensemble,
                    config: _config,
                    results: {},
                    usageScenario: exp.usageScenario
                }, (err: any, exp: IExperimentModel) => {
                    if (err) {
                        console.log("Error:" + err);
                        return next(err);
                    }
                    // console.log("experiment posted!:" + exp);
                    let id = exp._id;
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    ExperimentRouter._handleExperiment(exp);
                    return;
                });
            })

            .get(verifyOrdinaryUser, (req: any, res: Response, next: NextFunction) => {
                ExperimentModel.repo.retrieve((err: any, experiments: IExperimentModel[]) => {
                    if (err) return next(err);
                    const username = req.decoded.username;
                    const userExperiments = experiments.filter((exp: any) => {
                        return exp.user.username === username;
                    });
                    return res.json(userExperiments);
                }, [
                        {
                            path: 'user',
                            select: 'username admin'
                        }
                    ]);
            })
            ;

        this._router.route('/:expId')
            .get(verifyOrdinaryUser, function (req: Request, res: Response, next: NextFunction) {
                ExperimentModel.repo.findById(req.params.expId,
                    function (err: any, experiment: any) {
                        if (err) return next(err);
                        const demandingUser: string = (<any>req).decoded.username;
                        const experimentUser: string = experiment.user.username;
                        if (demandingUser === experimentUser)
                            return res.json(experiment);
                        else {
                            console.log('Users mismatch!', demandingUser, experimentUser);
                            const error = new Error('Users mismatch!' + demandingUser + experimentUser);
                            next(error);
                        }
                    }, [
                        {
                            path: 'user'
                        },
                        {
                            path: 'results.wevoteClassification',
                            model: 'WevoteClassificationPatch'
                        },
                        {
                            path: 'results.taxonomyAbundanceProfile',
                            model: 'TaxonomyAbundanceProfile',
                            populate: {
                                path: 'taxline'
                            }
                        }
                    ]);
            })
            ;
    }

    public static router(): any {
        let _ = new ExperimentRouter();
        return _._router;
    }

    private static _handleExperiment(exp: IExperimentModel) {
        const usageScenario = exp.usageScenario;
        switch (usageScenario.value) {
            case 'pipelineFromReads':
                { } break;
            case 'pipelineFromSimulatedReads':
                { } break;
            case 'classificationFromEnsemble':
                {
                    const ensemble = fs.readFileSync(UploadRouter.uploadsDir + '/' + exp.ensemble.uri).toString().trim();
                    // split on newlines...
                    let lines = ensemble.split('\n');
                    const algorithms: string[] = WevoteClassificationPatchModel.extractAlgorithms(lines[0]);
                    exp.config.algorithms = <IAlgorithmModel[]>algorithms.map((value: string) => {
                        return <IAlgorithmModel>{ name: value, used: true };
                    });
                    lines = (WevoteClassificationPatchModel.isHeaderLine(lines[0])) ? lines.slice(1) : lines;
                    const unclassifiedReads = new Array<IWevoteClassification>();
                    lines.forEach((line: string) => {
                        const tokens = line.split(',');
                        const unclassifiedRead: IWevoteClassification = <any>
                            {
                                seqId: tokens[0],
                                votes: tokens.slice(1).map((val: string) => { return parseInt(val, 10); })
                            }
                        unclassifiedReads.push(unclassifiedRead);
                    });
                    const submission: IWevoteSubmitEnsemble =
                        {
                            resultsRoute:
                            {
                                host: config.host,
                                port: config.port,
                                relativePath: '/experiment/classification'
                            },
                            jobID: exp._id,
                            reads: unclassifiedReads,
                            status: <any>{},
                            score: exp.config.minScore,
                            minNumAgreed: exp.config.minNumAgreed,
                            penalty: exp.config.penalty
                        };
                    const options: http.RequestOptions = {
                        host: config.cppWevoteUrl,
                        port: config.cppWevotePort,
                        path: config.cppWevoteClassificationPath,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                    const httpreq = http.request(options, function (response) {
                        response.setEncoding('utf8');
                        response.on('end', function () {
                            console.log('ensemble file posted to wevote core server');
                            response.on('error', function (err: Error) {
                                console.log('Error:' + err);
                            });
                        });
                    });
                    exp.save((err: any, exp: IExperimentModel) => {
                        if (err) throw Error('Error saving experiment model.');
                        httpreq.write(JSON.stringify(submission));
                        httpreq.end();
                    });

                } break;
        }
    }
}