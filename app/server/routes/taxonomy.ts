import {BaseRoute} from "./route";
import {Request, Response, NextFunction} from 'express';
import {TaxonomyModel} from '../models/taxonomy';

export class TaxonomyRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/')
            .get((req: Request, res: Response, next: NextFunction) => {
                res.json(this.findAllTaxonomy());
            })
            .post((req: Request, res: Response, next: NextFunction) => {
                this.createTaxonomy(req.body,
                    function ( err : any ) {
                        if( err ) return next( err );
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end();
                    });
            });
    }

    private findAllTaxonomy = (): any => {
        TaxonomyModel.repo.retrieve( function (err: any, taxonomies: any) {
            if (err) throw err;
            return taxonomies;
        });
    }

    private createTaxonomy = (data: any, cb: any): any => {
        TaxonomyModel.repo.create( data, function (err: any, taxonomy: any) {
            if (err) return cb( err );
            cb( null );
        });
    }

    static router()
    {
        let _ = new TaxonomyRouter();
        return _._router;
    }
}
