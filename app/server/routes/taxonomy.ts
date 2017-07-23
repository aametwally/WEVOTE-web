import { BaseRoute } from "./route";
import { Request, Response, NextFunction } from 'express';
import { TaxonomyModel } from '../models/taxonomy';

export class TaxonomyRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/')
            .get((req: Request, res: Response, next: NextFunction) => {
                TaxonomyModel.repo.retrieve(function (err: any, taxonomies: any) {
                    if (err) return next(err);
                    res.json(taxonomies);
                });
            })
            .post((req: Request, res: Response, next: NextFunction) => {
                TaxonomyModel.repo.create(req.body, function (err: any, taxonomy: any) {
                    if (err) return next(err);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end();
                });
            });
    }

    static router() {
        let _ = new TaxonomyRouter();
        return _._router;
    }
}
