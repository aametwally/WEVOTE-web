import {BaseRoute} from "./route";
import {ExperimentModel,IExperimentModel,IConfig,IStatus} from '../models/experiment';
import {Request, Response, NextFunction} from 'express';
import {IReadsModel} from "../models/reads";
import {ITaxonomyModel} from "../models/taxonomy";




export class ExperimentRouter extends BaseRoute
{

    constructor()
    {
        super();

        this._router.route('/')
            .post(function (req: any, res:any , next: any) {
                console.log(req.body);

                let exp = req.body;

                let _reads: IReadsModel = <any> {
                    name: exp.reads.name ,
                    description: "somDesc",
                    onServer: true,
                    uri: exp.reads.uri ,
                    data: exp.reads.data ,
                    size: exp.reads.size ,
                    count: exp.reads.count
                };

                let _taxonomy: ITaxonomyModel = <any>{
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

                ExperimentModel.repo.create( <any> {
                    user: exp.user,
                    isPrivate: exp.private,
                    email: exp.email,
                    description: exp.description,
                    reads: _reads,
                    taxonomy: _taxonomy,
                    config: _config,
                },function (err: any, exp: any) {
                    if (err) {
                        console.log("Error:"+err);
                        throw err;
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
                ExperimentModel.repo.retrieve( function (err: any, experiments: any) {
                    if (err) throw err;
                    res.json(experiments);
                });
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