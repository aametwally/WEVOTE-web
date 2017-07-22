import {AlgorithmModel} from '../models/algorithm';
import {BaseRoute} from "./route";
import {Request, Response, NextFunction} from 'express';


// router.route('/:algId')
// .all(function(req,res,next) {
//       res.writeHead(200, { 'Content-Type': 'text/plain' });
//       next();
// })

// .get(function(req,res,next){
//         res.end('Will send details of the algorithm: ' + req.params.algId +' to you!');
// });

export class AlgorithmRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/')
            .get(function (req: Request, res: Response, next: NextFunction) {
                AlgorithmModel.repo.retrieve( function (err: any, algorithms: any) {
                    if (err) throw err;
                    res.json(algorithms);
                });
            });
    }

    public static router() {
        let _ = new AlgorithmRouter();
        return _._router;
    }
}