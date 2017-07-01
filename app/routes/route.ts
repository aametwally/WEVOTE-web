/**
 * Created by warsha on 30/06/2017.
 */
import { Router } from "express";
import { json } from 'body-parser';
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
    constructor()
    {
        this._router = Router();
        this._router.use(json());
    }
}