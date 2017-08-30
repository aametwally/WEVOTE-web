import { TaxonomyAbundanceProfileModel } from '../models/taxprofile';
import { WevoteClassificationPatchModel , IWevoteClassificationPatch } from '../models/wevote';
import { BaseRoute } from "./route";
import { Request, Response, NextFunction } from 'express';
import construct = Reflect.construct;


// router.route('/:algId')
// .all(function(req,res,next) {
//       res.writeHead(200, { 'Content-Type': 'text/plain' });
//       next();
// })

// .get(function(req,res,next){
//         res.end('Will send details of the algorithm: ' + req.params.algId +' to you!');
// });

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

        this._router.route('/wevote/ensemble')
        .get(function( req: Request , res: Response , next: NextFunction ){ 
            WevoteClassificationPatchModel.repo.findOne( {} , 
                (err: any , result: IWevoteClassificationPatch ) => {
                    if( err ) return next( err );
                    const wevoteSubmitEnsembleRequest = {
                        jobID : result.experiment , 
                        reads : result.patch , 
                        score : 2 , 
                        penalty: 3 ,
                        minNumAgreed: 2
                    }
                    res.json( wevoteSubmitEnsembleRequest );
                });
        });
    }

    public static router() {
        let _ = new TaxonomyAbundanceProfileRouter();
        return _._router;
    }
}