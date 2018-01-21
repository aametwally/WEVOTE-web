import { BaseRoute } from "./route";
import {
    ExperimentModel, IExperimentModel, IConfig, IUsageScenario, IResults
} from '../models/experiment';
import { Request, Response, NextFunction } from 'express';
import { IRemoteFile } from "../models/remotefile";
import { UserModel, IUserModel } from '../models/user';
import {
    IWevoteClassification, IWevoteClassificationPatch,
    WevoteClassificationPatchModel
} from '../models/wevote';
import {
    ITaxonomyAbundanceProfile,
    TaxonomyAbundanceProfileModel
} from '../models/taxprofile';
import { IAlgorithm } from '../models/algorithm';
import { verifyOrdinaryUser } from './verify';
import { UploadRouter } from './upload';
import * as fs from 'fs';
import * as http from 'http';
import * as nodemailer from 'nodemailer';
const config = require('../config');
import * as mongoose from 'mongoose';
import { IWevoteSubmitEnsemble } from '../common/common';

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
                const abundanceResults: ITaxonomyAbundanceProfile =
                    <any>{
                        experiment: expId,
                        abundance: submission.abundance
                    }

                WevoteClassificationPatchModel.repo.create(classificationResults, (err: any, classificationDoc: IWevoteClassificationPatch) => {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    TaxonomyAbundanceProfileModel.repo.create(abundanceResults, (err: any, abundanceDoc: ITaxonomyAbundanceProfile) => {
                        ExperimentModel.repo.findById(expId, (err: any, experiment: IExperimentModel) => {
                            if (err) {
                                console.log(err);
                                return next(err);
                            }
                            experiment.status = classificationDoc.status;

                            experiment.results = <any>{
                                wevoteClassification: classificationDoc._id,
                                taxonomyAbundanceProfile: abundanceDoc._id
                            };
                            
                            // use algorithms as sorted by the core server.
                            experiment.config.algorithms = submission.algorithms
                                .map((algStr: string) => {
                                    return <IAlgorithm>{ name: algStr, used: true };
                                });
                            
                            experiment.save((err: any, exp: IExperimentModel) => {
                                res.writeHead(200, { 'Content-Type': 'text/plain' });
                                res.end();
                                return ExperimentRouter._sendEmail(exp);
                            });
                        });
                    });
                });
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
                    uri: exp.reads.uuid,
                    data: exp.reads.data,
                    size: exp.reads.size,
                    count: exp.reads.count
                };
                
                const _config: IConfig = <any>{
                    algorithms: exp.config.algorithms,
                    minScore: exp.config.minScore,
                    minNumAgreed: exp.config.minNumAgreed,
                    penalty: exp.config.penalty
                };
                ExperimentModel.repo.create(<any>{
                    user: req.decoded._id,
                    email: exp.email,
                    description: exp.description,
                    reads: _reads,
                    config: _config,
                    results: {},
                    usageScenario: exp.usageScenario
                }, (err: any, exp: IExperimentModel) => {
                    if (err) {
                        console.log("Error:" + err);
                        return next(err);
                    }
                    let id = exp._id;
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    ExperimentRouter._handleExperiment(exp);
                    return res.end();
                });
            })

            .get(verifyOrdinaryUser, (req: any, res: Response, next: NextFunction) => {
                ExperimentModel.repo.retrieve((err: any, experiments: IExperimentModel[]) => {
                    if (err) return next(err);
                    if (req.decoded) {
                        const username = req.decoded.username;
                        const userExperiments = experiments.filter((exp: any) => {
                            return  exp.user && exp.user.username === username;
                        });
                        return res.json(userExperiments);
                    }
                    else {
                        const error = new Error('Not logged in!');
                        return next(error);
                    }

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
                        const loggedIn: Boolean = experiment && (<any>req).decoded && (<any>experiment.user);
                        if (loggedIn && (<any>req).decoded.username === experiment.user.username)
                            return res.json(experiment);
                        else {
                            console.log('Users mismatch or not logged in!');
                            const error = new Error('Users mismatch or not logged in!');
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

            .delete(verifyOrdinaryUser, function (req: Request, res: Response, next: NextFunction) {
                ExperimentModel.repo.findById(req.params.expId,
                    (err: any, experiment: IExperimentModel) => {
                        if (err) return next(err);
                        if (experiment) {
                            const loggedIn: Boolean =
                                typeof (<any>req).decoded !== 'undefined' &&
                                typeof experiment.user !== 'undefined';
                            if (loggedIn && (<any>req).decoded.username === (<any>experiment.user).username) {
                                if (experiment.results) {
                                    WevoteClassificationPatchModel.repo.findByIdQuery(
                                        experiment.results.wevoteClassification
                                    ).remove().exec();
                                    TaxonomyAbundanceProfileModel.repo.findByIdQuery(
                                        experiment.results.taxonomyAbundanceProfile
                                    ).remove().exec();
                                    ExperimentModel.repo.findByIdQuery(
                                        experiment._id
                                    ).remove().exec();
                                }
                            }
                            else {
                                console.log('Users mismatch or not logged in!');
                                const error = new Error('Users mismatch or not logged in!');
                                next(error);
                            }
                        }
                    }, [
                        {
                            path: 'user'
                        }]);
            })
            ;
    }

    public static router(): any {
        let _ = new ExperimentRouter();
        return _._router;
    }

    private static _handleExperiment(exp: IExperimentModel) {
        const usageScenario = exp.usageScenario;
        const resutlsPort = (process.env.WEVOTE_WEB_PORT === 'undefined')? config.port : parseInt( <string>process.env.WEVOTE_WEB_PORT );

        switch (usageScenario.value) {
            case 'pipelineFromReads':
                {
                    const reads = fs.readFileSync(UploadRouter.uploadsDir + '/' + exp.reads.uuid).toString().trim();
                    // split on newlines...
                    let sequences = reads.split('\n');
                    const algorithms: string[] = exp.config.algorithms.map((alg: IAlgorithm) => {
                        return alg.name;
                    });
                    if (WevoteClassificationPatchModel.isHeaderLine(sequences[0]))
                        sequences = sequences.slice(1);

                    const submission: IWevoteSubmitEnsemble =
                        {
                            resultsRoute:
                                {
                                    host: config.localhost,
                                    port: resutlsPort,
                                    relativePath: '/experiment/classification'
                                },
                            jobID: exp._id,
                            reads: [],
                            abundance: [],
                            sequences: sequences,
                            algorithms: algorithms,
                            status: <any>{},
                            score: exp.config.minScore,
                            minNumAgreed: exp.config.minNumAgreed,
                            penalty: exp.config.penalty,
                            distances: <any>[]
                        };
                    const options: http.RequestOptions = {
                        host: config.cppWevoteUrl,
                        port: config.cppWevotePort,
                        path: config.cppWevoteFullPipelinePath,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                    const httpreq = http.request(options, function (response) {
                        response.setEncoding('utf8');
                        response.on('end', function () {
                            console.log('reads file posted to wevote core server');
                            response.on('error', function (err: Error) {
                                console.log('Error:' + err);
                            });
                        });
                    });
                    httpreq.write(JSON.stringify(submission));
                    httpreq.end();
                } break;
            case 'abundanceFromClassification':
                {
                    const classification = fs.readFileSync(UploadRouter.uploadsDir + '/' + exp.reads.uuid).toString().trim();
                    // split on newlines...
                    let lines = classification.split('\n');
                    if (!WevoteClassificationPatchModel.isClassified(lines[0])) {
                        console.error('File must include header, and must be classified.');
                    }

                    const algorithms: string[] = WevoteClassificationPatchModel.extractAlgorithms(lines[0]);
                    exp.config.algorithms = <IAlgorithm[]>algorithms.map((value: string) => {
                        return <IAlgorithm>{ name: value, used: true };
                    });
                    const headerLine = lines[0].trim().split(',');
                    lines = lines.slice(1);
                    const wevoteColumn = headerLine.indexOf('WEVOTE');
                    const distanceFirstColumn = headerLine.indexOf(`dist(${algorithms[0]})`);
                    const distanceLastColumn = headerLine.indexOf(`dist(${algorithms[algorithms.length - 1]})`);
                    const numToolsAgreedColumn = headerLine.indexOf('numToolsAgreed');
                    const numToolsReportedColumn = headerLine.indexOf('numToolsReported');
                    const numToolsUsedColumn = headerLine.indexOf('numToolsUsed');
                    const scoreColumn = headerLine.indexOf('score');
                    const costColumn = headerLine.indexOf('cost');

                    const classifiedReads = new Array<IWevoteClassification>();
                    lines.forEach((line: string) => {
                        const tokens = line.split(',');
                        const classifiedRead: IWevoteClassification = <any>
                            {
                                seqId: tokens[0],
                                votes: tokens.slice(4, wevoteColumn).map((val: string) => { return parseInt(val, 10); }),
                                numToolsReported: tokens[numToolsReportedColumn],
                                numToolsAgreed: tokens[numToolsAgreedColumn],
                                numToolsUsed: tokens[numToolsUsedColumn],
                                score: parseFloat(tokens[scoreColumn]),
                                distances: tokens.slice(distanceFirstColumn, distanceLastColumn + 1)
                                    .map((d: string) => { return parseFloat(d); }),
                                cost: parseFloat(tokens[costColumn]),
                                WEVOTE: parseInt(tokens[wevoteColumn])
                            }
                        classifiedReads.push(classifiedRead);
                    });
                    const submission: IWevoteSubmitEnsemble =
                        {
                            resultsRoute:
                                {
                                    host: config.localhost,
                                    port: resutlsPort,
                                    relativePath: '/experiment/classification'
                                },
                            jobID: exp._id,
                            reads: classifiedReads,
                            abundance: [],
                            sequences: [],
                            algorithms: [],
                            status: <any>{},
                            score: exp.config.minScore,
                            minNumAgreed: exp.config.minNumAgreed,
                            penalty: exp.config.penalty,
                            distances: <any>[]
                        };
                    const options: http.RequestOptions = {
                        host: config.cppWevoteUrl,
                        port: config.cppWevotePort,
                        path: config.cppWevoteAbundancePath,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                    const httpreq = http.request(options, function (response) {
                        response.setEncoding('utf8');
                        response.on('end', function () {
                            console.log('classification file posted to wevote core server');
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
            case 'classificationFromEnsemble':
                {
                    const ensemble = fs.readFileSync(UploadRouter.uploadsDir + '/' + exp.reads.uuid).toString().trim();
                    // split on newlines...
                    let lines = ensemble.split('\n');
                    const algorithms: string[] = WevoteClassificationPatchModel.extractAlgorithms(lines[0]);
                    exp.config.algorithms = <IAlgorithm[]>algorithms.map((value: string) => {
                        return <IAlgorithm>{ name: value, used: true };
                    });
                    if (!WevoteClassificationPatchModel.isClassified(lines[0])) {
                        console.error('File must include header, and must be classified.');
                    }
                    const headerLine = lines[0];
                    lines = lines.slice(1);
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
                                    host: config.localhost,
                                    port: resutlsPort,
                                    relativePath: '/experiment/classification'
                                },
                            jobID: exp._id,
                            reads: unclassifiedReads,
                            abundance: [],
                            sequences: [],
                            algorithms: [],
                            status: <any>{},
                            score: exp.config.minScore,
                            minNumAgreed: exp.config.minNumAgreed,
                            penalty: exp.config.penalty,
                            distances: <any>[]
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

    private static _sendEmail(exp: IExperimentModel) {
        ExperimentModel.repo.findById(exp._id,
            (err: any, experiment: IExperimentModel) => {
                if (err) {
                    console.log('Experiment couldn`t be loaded:', err);
                    return
                }

                const user: IUserModel = <any>experiment.user;
                const transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user: config.wevoteGmail,
                        pass: config.wevoteGmailPassword
                    }
                });

                const mailContent: string =
                    `
                    A WEVOTE experiment, posted by your account ${(user) ? user.username : '(not logged in!)'}, is now completed.
                    You can download or visualize your results, after logging in, at
                    <a href="${config.url}:${config.port}/#!/results/${exp._id}">this link</a><br>
                    Experiment description: ${exp.description} <br>
                    Thanks for using WEVOTE classifier!
                    `;
                var mailOptions = {
                    from: `WEVOTE Team <${config.wevoteGmail}>`,
                    to: exp.email,
                    subject: `[WEVOTE Experiment finished] ${exp.description.slice(0, 100) + '..'}`, // Subject line
                    html: mailContent
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Message sent: ' + info.response);
                    };
                });
            }, [{ path: 'user' }]);

    }
}