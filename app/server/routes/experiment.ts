import { BaseRoute } from "./route";
import { ExperimentModel, IExperimentModel, IConfig, IStatus } from '../models/experiment';
import { Request, Response, NextFunction } from 'express';
import { IRemoteFile } from "../models/remotefile";
import { UserModel, IUserModel } from '../models/user';
import { verifyOrdinaryUser } from './verify';

export class ExperimentRouter extends BaseRoute {

    constructor() {
        super();

        this._router.route('/')
            .post(verifyOrdinaryUser,
            function (req: any, res: any, next: any) {
                console.log(req.body);

                let exp = req.body;

                // ///////////////////////////
                ///////////////////////////////////
                /////////
                COMPLETE THIS:RECEIVE ENSEB<E FILE APPROPRIATELY
                let _reads: IRemoteFile = <any>{
                    name: exp.reads.name,
                    description: "somDesc",
                    onServer: true,
                    uri: exp.reads.uri,
                    data: exp.reads.data,
                    size: exp.reads.size,
                    count: exp.reads.count
                };

                let _taxonomy: IRemoteFile = <any>{
                    name: "taxName",
                    description: "somDesc",
                    onServer: true,
                    uri: "somURI",
                    data: "somData",
                    size: 0
                };

                let _config: IConfig = <any>{
                    algorithms: exp.config.algorithms,
                    minScore: exp.config.minScore,
                    minNumAgreed: exp.config.minNumAgreed,
                    penalty: exp.config.penalty
                };

                console.log("decoded:", req.decoded);
                ExperimentModel.repo.create(<any>{
                    user: req.decoded._id,
                    isPrivate: exp.private,
                    email: exp.email,
                    description: exp.description,
                    reads: _reads,
                    taxonomy: _taxonomy,
                    config: _config,
                    results: {}
                }, function (err: any, exp: any) {
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
            .get( verifyOrdinaryUser,  function ( req: Request, res: Response, next: NextFunction) {
                console.log('getting experiment:',req.params.expId);
                ExperimentModel.repo.findById(req.params.expId,
                    function (err: any, experiment: any) {
                        if (err) return next(err);
                        const demandingUser : string = (<any>req).decoded.username;
                        const experimentUser: string = experiment.user.username;
                        console.log( experiment.user );

                        if( demandingUser === experimentUser  )
                            return res.json(experiment);
                        else {
                            console.log('Users mismatch!',demandingUser,experimentUser);
                            const error = new Error('Users mismatch!'+demandingUser+experimentUser);
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
                            model: 'TaxonomyAbundanceProfile' ,
                            populate : {
                                path: 'taxline' 
                            }
                        }
                    ]);
            })
            ;
    }

    public static router() {
        let _ = new ExperimentRouter();
        return _._router;
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