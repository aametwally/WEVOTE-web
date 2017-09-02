import { BaseRoute } from "./route";
import { Request, Response, NextFunction } from 'express';
import { ReadModel } from '../models/reads';

export class ReadsRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/')
            .get((req: Request, res: Response, next: NextFunction) => {
                ReadModel.repo.retrieve(function (err: any, reads: any) {
                    if (err) return next(err);
                    res.json(reads);
                });
            })
            .post((req: Request, res: Response, next: NextFunction) => {
                this.createReads(req.body,
                    function (err: any) {
                        if (err) return next( err );
                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end();
                    });
            });
    }

    private createReads = (data: any, cb: any): any => {
        ReadModel.repo.create(data, function (err: any, reads: any) {
            if (err) return cb( err );
            cb( null );
        });
    };

    static router() {
        let _ = new ReadsRouter();
        return _._router;
    }
}
