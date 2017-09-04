import { BaseRoute } from "./route";
import { ExperimentModel, IExperimentModel, IConfig, IStatus, IUsageScenario } from '../models/experiment';
import { Request, Response, NextFunction } from 'express';
import { IRemoteFile } from "../models/remotefile";
import { UserModel, IUserModel } from '../models/user';
import { IWevoteClassification, IWevoteClassificationPatch , IWevoteSubmitEnsemble } from '../models/wevote';
import { verifyOrdinaryUser } from './verify';
import { UploadRouter } from './upload';
import * as fs from 'fs';
import * as http from 'http';
import { config } from '../config'


export class ExperimentRouter extends BaseRoute {

    constructor() {
        super();

        this._router.route('/')
            .post(verifyOrdinaryUser,
            (req: any, res: any, next: any) => {
                console.log(req.body);

                let exp = <IExperimentModel>req.body;

                // ///////////////////////////
                ///////////////////////////////////
                /////////
                // COMPLETE THIS:RECEIVE ENSEB<E FILE APPROPRIATELY
                // const _usageScenario: IUsageScenario  = <any>{
                //     value: exp.usageScenario.v
                // }

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
                }

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

                console.log("decoded:", req.decoded);
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
                    console.log("experiment posted!:" + exp);
                    let id = exp._id;
                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Added the exp id: ' + id);

                    ExperimentRouter._handleExperiment(exp);

                });
            })

            .get(function (req: Request, res: Response, next: NextFunction) {
                ExperimentModel.repo.retrieve(function (err: any, experiments: any) {
                    if (err) return next(err);

                    res.json(experiments);
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
                console.log('getting experiment:', req.params.expId);
                ExperimentModel.repo.findById(req.params.expId,
                    function (err: any, experiment: any) {
                        if (err) return next(err);
                        const demandingUser: string = (<any>req).decoded.username;
                        const experimentUser: string = experiment.user.username;
                        console.log(experiment.user);

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
                            path: 'results.wevoteClassification'
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

    public static router() : any  {
        let _ = new ExperimentRouter();
        return _._router;
    }

    private static _handleExperiment(exp: IExperimentModel) {
        const usageScenario = exp.usageScenario;
        switch (usageScenario.value) {
            case 'pipelineFromReads':
                {}break;
            case 'pipelineFromSimulatedReads':
                {}break;
            case 'classificationFromEnsemble':
                {

                    const ensemble = fs.readFileSync(UploadRouter.uploadsDir + '/' + exp.ensemble.uri ).toString().trim();

                    // split on newlines...
                    const lines = ensemble.split('\n');
                    const unclassifiedReads = new Array<IWevoteClassification>();
                    lines.forEach((line: string) => {
                        const tokens = line.split(',');
                        const unclassifiedRead: IWevoteClassification = <any>
                            {
                                seqId: tokens[0],
                                votes: tokens.slice(1).map((val: string) => {
                                    return parseInt(val, 10);
                                })
                            }
                        unclassifiedReads.push(unclassifiedRead);
                    });
                    const submission: IWevoteSubmitEnsemble =
                        {
                            jobID: exp._id,
                            reads: unclassifiedReads,
                            score: exp.config.minScore,
                            minNumAgreed: exp.config.minNumAgreed,
                            penalty: exp.config.penalty
                        }

                    const options : http.RequestOptions = {
                        host: config.cppWevoteUrl,
                        port: config.cppWevotePort,
                        path: '/wevote/submit/ensemble',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };

                    const httpreq = http.request(options, function (response) {
                        response.setEncoding('utf8');
                        response.on('data', function (chunk) {
                            console.log("body: " + chunk);
                        });

                        response.on('end', function () {
                            console.log('ensemble file posted to wevote core server');

                        response.on('error', function( err: Error ){
                            console.log('Error:'+err);
                        });
                        })
                    });
                    httpreq.write(JSON.stringify(submission));
                    httpreq.end();
                } break;
        }
    }
}

// router.route('/:expId')
// .all(function(req,res,next) {
//       res.writeHead(200, { 'Content-Type': 'text/plain' });
//       next();
// })

// .get(function(req,res,next){
//         res.end('Will send details of the experiment: ' + req.params.expId +' to you!');
// });