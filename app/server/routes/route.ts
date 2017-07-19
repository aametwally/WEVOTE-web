/**
 * Created by warsha on 30/06/2017.
 */
import {Router} from "express";
import {json} from 'body-parser';
import {Request, Response, NextFunction} from 'express';

/**
 * Constructor
 *
 * @class BaseRoute
 */
export class BaseRoute {
    protected _router: Router;

    /**
     * Constructor
     *
     * @class BaseRoute
     * @constructor
     */
    constructor() {
        this._router = Router();
        this._router.use(json());
    }
    //
    // public static  auth(req: Request, res: Response, next: NextFunction) {
    //     console.log(req.headers);
    //     if (!req.session.user) {
    //         let authHeader: string = req.headers.authorization;
    //         if (!authHeader) {
    //             let err = new Error('You are not authenticated!');
    //             res.status( 401 );
    //             next(err);
    //             return;
    //         }
    //         let auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
    //         let user = auth[0];
    //         let pass = auth[1];
    //         if (user == 'admin' && pass == 'password') {
    //             req.session.user = 'admin';
    //             next(); // authorized
    //         } else {
    //             let err = new Error('You are not authenticated!');
    //             res.status( 401 );
    //             next(err);
    //         }
    //     }
    //     else {
    //         if (req.session.user === 'admin') {
    //             console.log('req.session: ', req.session);
    //             next();
    //         }
    //         else {
    //             let err = new Error('You are not authenticated!');
    //             res.status( 401 );
    //             next(err);
    //         }
    //     }
    // }
}