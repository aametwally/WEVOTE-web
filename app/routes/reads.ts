import {BaseRoute} from "./route";
import {Request, Response, NextFunction} from 'express';
import {ReadsModel} from '../models/reads';

export class ReadsRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/')
            .get((req: Request, res: Response, next: NextFunction) => {
                res.json(this.findAllReads());
            })
            .post((req: Request, res: Response, next: NextFunction) => {
                this.createReads(req.body,
                    function () {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end();
                    });
            });
    }

    private findAllReads = (): any => {
        ReadsModel.repo.retrieve( function (err: any, reads: any) {
            if (err) throw err;
            return reads;
        });
    };

    private createReads = (data: any, cb?: any): any => {
        ReadsModel.repo.create(data, function (err: any, reads: any) {
            if (err) throw err;
            var id = reads._id;
            console.log("reads posted!:" + id);
            if (cb) cb();
        });
    };

    static router()
    {
        let _ = new ReadsRouter();
        return _._router;
    }
}
