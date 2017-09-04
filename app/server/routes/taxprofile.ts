import { TaxonomyAbundanceProfileModel } from '../models/taxprofile';
import { WevoteClassificationPatchModel , IWevoteClassificationPatch , IWevoteClassification } from '../models/wevote';
import { BaseRoute } from "./route";
import { Request, Response, NextFunction } from 'express';

export class TaxonomyAbundanceProfileRouter extends BaseRoute {
    constructor() {
        super();
        this._router.route('/')
            .get(function (req: Request, res: Response, next: NextFunction) {
                TaxonomyAbundanceProfileModel.repo.retrieve((err: any, profiles: any) => {
                    if (err) return next(err);
                    res.json(profiles);
                }, [{
                    path: 'experiment',
                    select: 'user description email'
                }]);
            });
    }

    public static router() :any {
        let _ = new TaxonomyAbundanceProfileRouter();
        return _._router;
    }
}